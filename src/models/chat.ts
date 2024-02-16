import jwt, { JwtPayload } from "jsonwebtoken";
import { strip } from "../utils";
import { DBManager } from "../config"
import Database from "../config/database"
import { UserDetails } from "./user"
import { HttpStatusCode } from "axios";
import Group from "./group";

export interface ChatDetails {
    id: number
    message: string
    received : boolean
    createdAt : Date
    updatedAt : Date

    sender: UserDetails

    reference?: ChatDetails | null
    reply?: ChatDetails[]
}

export interface GroupChatDetails {
    id: number,
    message: string,
    createdAt : Date,
    updatedAt : Date,

    sender: UserDetails,
    group?: Group | null,

    reference?: GroupChatDetails | null
    reply?: GroupChatDetails[]
}

class Chat {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(platform: string, token: string, data: { chat: { message: string, receiverID?: string, groupID?: number}, organization?: string }): Promise<ChatDetails | GroupChatDetails | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            if(data.chat.groupID){
                const chat = await this.database.db.groupChat.create({ 
                    data: { senderID: user.id, message: data.chat.message, groupID: data.chat.groupID },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                    }
                });
                return chat;
            }

            if(data.chat.receiverID){
                let channel = await this.database.db.channel.findFirst({
                    where: { 
                        OR: [ { userOneID: user.id, userTwoID: data.chat.receiverID }, { userOneID: data.chat.receiverID, userTwoID: user.id } ], 
                        organization: data.organization, platform
                    }
                });

                if(!channel){
                    channel = await this.database.db.channel.create({ data: { platform, userOneID: user.id, userTwoID: data.chat.receiverID, organization: data.organization } });
                }

                const chat = await this.database.db.chat.create({
                    data: { message: data.chat.message, senderID: user.id, channelID: channel.id },
                    include: { sender: true, reply: { include: { sender: true } } }
                });

                return chat;
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }

    async reply(token: string, data: { chat: { message: string, chatID: number, channelID?: number, groupID?: number}, organization?: string }): Promise<ChatDetails | GroupChatDetails | undefined>{
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

    async update(token: string, data: { chat: { message: string, chatID: number, channelID?: number, groupID?: number}, organization?: string }): Promise<ChatDetails | GroupChatDetails | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            if(data.chat.groupID){
                const chat = await this.database.db.groupChat.update({ 
                    where: { id: data.chat.chatID, senderID: user.id, groupID: data.chat.groupID, },
                    data: { message: data.chat.message },
                    include: {
                        sender: true,
                        reply: { include: { sender: true } },
                        reference: { include: { sender:  true } }
                    }
                });
                return chat;
            }

            if(data.chat.channelID){
                const chat = await this.database.db.chat.update({
                    where: { id: data.chat.chatID, senderID: user.id, channelID: data.chat.channelID,  },
                    data: { message: data.chat.message },
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
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }
}

export default Chat;