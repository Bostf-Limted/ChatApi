import { HttpStatusCode } from "axios";
import { DBManager } from "../../config";
import Database from "../../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Channel, Group, Notification, User } from "@prisma/client";

class UserModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { token: string, projectID: number, jwtAccessKey: string, organization?: string }): Promise<User | undefined>{
        try{
            const { user } = jwt.verify(data.token, data.jwtAccessKey ) as JwtPayload;
            const init = await this.database.db.user.upsert({
                where: { id: user.id, projectID: data.projectID, organization: data.organization }, 
                update: { lastSeen: new Date()  }, 
                create: { projectID: data.projectID, organization: data.organization, id: user.id, name: user.name, surname: user.surname, email: user.email, phone: user.phone } });

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }

    async delete(data: { token: string, projectID: number, jwtAccessKey: string, organization?: string }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(data.token, data.jwtAccessKey ) as JwtPayload;
            await this.database.db.user.delete({ where: { id: user.id, projectID: data.projectID, organization: data.organization } });

            return "user was deleted successfully";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }

    async get(data: { token: string, projectID: number, jwtAccessKey: string, organization?: string }): Promise<{ user: User, chats: Array<Group | Channel>, notifications: Notification[] } | undefined>{
        try{
            const { user } = jwt.verify(data.token, data.jwtAccessKey ) as JwtPayload;

            const notifications = await this.database.db.notification.findMany(
                { where: { recieverID: user.id, projectID: data.projectID, organization: data.organization, },
                include: { sender: true, group: true },
                orderBy: { created: "desc" }
            });

            const channels = await this.database.db.channel.findMany({ 
                where: { OR: [ { userOneID: user.id, }, { userTwoID: user.id } ], projectID: data.projectID, organization: data.organization },
                include: { chats: { include: {  sender: true }, orderBy: { createdAt:  "desc" } } },
            });

            const memebers = await this.database.db.member.findMany({
                where: { userID: user.id, group: { projectID: data.projectID, organization: data.organization } },
            });

            const groups: Group[] = [];
            for(let i = 0; i < memebers.length; i++){
                const member = memebers[i];
                const group = await this.database.db.group.findUnique({
                    where: { id: member.groupID },
                    include: { members: { include: { user: true } }, chats: { where:{ createdAt: { gte: member.joined } }, orderBy: { createdAt:  "desc" }, include: { sender: true } } } }
                );

                groups.push(group!);
            }

            const chats = [ ...channels, ...groups ].sort((a, b)=> b.lastCommunicated.valueOf() - a.lastCommunicated.valueOf());

            return { user, chats, notifications };
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }
}

export default UserModel;