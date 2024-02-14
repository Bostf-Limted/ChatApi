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

    reply: ChatDetails[]
}

export interface GroupChatDetails {
    id: number
    message: string
    received : boolean
    createdAt : Date
    updatedAt : Date

    group?: Group

    reply: GroupChatDetails[]
}

class Chat {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(token: string, data: { chat: { message: string, receiver?: string, group?: string}, organization?: string }): Promise<ChatDetails | GroupChatDetails | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            if(data.chat.group){
                const group = await this.database.db.group.findFirst({ where: { name: data.chat.group, organization: data.organization } });
                if(group){
                    const chat = await this.database.db.groupChat.create({ data: { senderID: user.id, message: data.chat.message, groupID: group.id } });

                    return { ...chat, reply: [] };
                }
            }

            if(data.chat.receiver){
                let channel = await this.database.db.channel.findFirst({
                    where: { 
                        OR: [ { userOneID: user.id, userTwoID: data.chat.receiver }, { userOneID: data.chat.receiver, userTwoID: user.id } ], 
                        organization: data.organization
                    }
                });

                if(!channel){
                    channel = await this.database.db.channel.create({ data: { userOneID: user.id, userTwoID: data.chat.receiver, organization: data.organization } });
                }

                const chat = await this.database.db.chat.create({
                    data: { message: data.chat.message, senderID: user.id, channelID: channel.id },
                    include: {  }
                });

                return { ...chat, reply: [] };
            }
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