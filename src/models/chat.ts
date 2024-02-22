import jwt, { JwtPayload } from "jsonwebtoken";
import { DBManager } from "../config"
import Database from "../config/database"
import { HttpStatusCode } from "axios";
import { Chat, Delivered, GroupChat } from "@prisma/client";
class ChatModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    private async updateGroup(platform: string, groupID: number, organization?: string): Promise<void>{
        await this.database.db.group.update({
            where: { platform, organization, id: groupID },
            data: { lastCommunicated: new Date() }
        });
    }
    
    private async updateChannel(platform: string, channelID: number, organization?: string): Promise<void>{
        await this.database.db.channel.update({
            where: { platform, organization, id: channelID },
            data: { lastCommunicated: new Date() }
        });
    }

    async create(platform: string, token: string, data: { message: string, receiverID?: string, groupID?: number, organization?: string }): Promise<Chat | GroupChat | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            if(data.groupID){
                const chat = await this.database.db.groupChat.create({ 
                    data: { senderID: user.id, message: data.message, groupID: data.groupID },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                    }
                });
                await this.updateGroup(platform, data.groupID, data.organization);

                const members = await this.database.db.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(user.id !== member.userID){
                        await this.database.db.notification.create({
                            data: { 
                                groupID: data.groupID, senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                                alert: `${user.name} drop a messge in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });
                return chat;
            }

            if(data.receiverID){
                let channel = await this.database.db.channel.findFirst({
                    where: { 
                        OR: [ { userOneID: user.id, userTwoID: data.receiverID }, { userOneID: data.receiverID, userTwoID: user.id } ], 
                        organization: data.organization, platform
                    }
                });

                if(!channel){
                    channel = await this.database.db.channel.create({ 
                        data: { platform, userOneID: user.id, userTwoID: data.receiverID, organization: data.organization },
                    });
                }

                const chat = await this.database.db.chat.create({
                    data: { message: data.message, senderID: user.id, channelID: channel.id },
                    include: { sender: true, reply: { include: { sender: true } } }
                });
                await this.updateChannel(platform, channel.id, data.organization);

                await this.database.db.notification.create({
                    data: { 
                        senderID: user.id, recieverID: data.receiverID, platform, organization: data.organization,
                        alert: `${user.name} sent you a message`,
                        message: data.message
                    }
                });

                return chat;
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when processing chat");
            }
        }
    }

    async reply(platform: string, token: string, data: { chat: { message: string, chatID: number, channelID?: number, groupID?: number}, organization?: string }): Promise<Chat | GroupChat | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            if(data.chat.groupID){
                const chat = await this.database.db.groupChat.create({ 
                    data: { senderID: user.id, message: data.chat.message, groupID: data.chat.groupID, referenceID: data.chat.chatID },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
                await this.updateGroup(platform, data.chat.groupID, data.organization);

                const members = await this.database.db.member.findMany({ where:{ groupID: data.chat.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(user.id !== member.userID){
                        await this.database.db.notification.create({
                            data: { 
                                groupID: data.chat.groupID, senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                                alert: `${user.name} replied to ${chat.reference?.sender.name} message in the ${member.group.name} group`,
                                message: data.chat.message
                            }
                        });
                    }
                });

                return chat;
            }

            if(data.chat.channelID){
                const chat = await this.database.db.chat.create({
                    data: { message: data.chat.message, senderID: user.id, channelID: data.chat.channelID, referenceID: data.chat.chatID },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
                await this.updateChannel(platform, data.chat.channelID, data.organization);

                await this.database.db.notification.create({
                    data: { 
                        senderID: user.id, recieverID: chat.reference?.sender.name!, platform, organization: data.organization,
                        alert: `${user.name} replied to your message`,
                        message: data.chat.message
                    }
                });

                return chat;
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when replying to chat");
            }
        }
    }

    async update(platform: string, token: string, data: { message: string, chatID: number, channelID?: number, groupID?: number, organization?: string }): Promise<Chat | GroupChat | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            if(data.groupID){
                const chat = await this.database.db.groupChat.update({ 
                    where: { id: data.chatID, senderID: user.id, groupID: data.groupID, },
                    data: { message: data.message },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });

                const members = await this.database.db.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });
                members.forEach(async  (member)=>{
                    if(user.id !== member.userID){
                        await this.database.db.notification.create({
                            data: { 
                                groupID: data.groupID, senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                                alert: `${user.name} updated a message in the ${member.group.name} group`,
                                message: data.message
                            }
                        });
                    }
                });

                return chat;
            }

            if(data.channelID){
                const chat = await this.database.db.chat.update({
                    where: { id: data.chatID, senderID: user.id, channelID: data.channelID,  },
                    data: { message: data.message },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });

                await this.database.db.notification.create({
                    data: { 
                        senderID: user.id, recieverID: chat.reference?.sender.name!, platform, organization: data.organization,
                        alert: `${user.name} edited a message`,
                        message: data.message
                    }
                });
                return chat;
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
            }
        }
    }

    async seen(data: { platform: string, token: string, chatID: number, channelID?: number, groupID?: number, organization?: string }): Promise<Chat | Delivered | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            if(data.groupID){
                const chat = await this.database.db.delivered.upsert({ 
                    where: { userID: user.id, groupID: data.groupID, chatID: data.chatID },
                    create: { userID: user.id, groupID: data.groupID, chatID: data.chatID },
                    update: {  },
                });
                return chat;
            }

            if(data.channelID){
                const chat = await this.database.db.chat.update({
                    where: { id: data.chatID, senderID: user.id, channelID: data.channelID,  },
                    data: { received: true },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
                return chat;
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating chat");
            }
        }
    }

    async delete(token: string, data: { chatID: number, channelID?: number, groupID?: number }): Promise<string| undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            if(data.groupID){
                await this.database.db.groupChat.delete({
                    where: { id: data.chatID,  senderID: user.id, groupID: data.groupID }
                });
            }

            if(data.channelID){
                await this.database.db.chat.delete({
                    where: { channelID: data.channelID, id: data.chatID, senderID: user.id, },
                });
            }
            return "chat deleting sucessful";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating deleting");
            }
        }
    }
}

export default ChatModel;