import jwt, { JwtPayload } from "jsonwebtoken";
import { DBManager } from "../config";
import Database from "../config/database";
import { GroupChatDetails } from "./chat";
import { HttpStatusCode } from "axios";
import { strip } from "../utils";

export interface GroupDetails{
    id: number
    name : string,
    chats: GroupChatDetails[]
    organization?: string | null
    platform: string
}

class Group {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(token: string, platform: string, data: { name: string, organization?: string }): Promise<GroupDetails | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const init = await this.database.db.group.create({
                data: { platform, name: data.name, organization: data.organization, creatorID: user.id },
            });

            await this.database.db.member.create({
                data: {  groupID: init.id, userID: init.creatorID, role: "admin" }
            });

            return  { ...init, chats: [] };
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating group");
            }
        }
    }

    async rename(token: string, platform: string, data: { groupID: number, organization?: string, name: string }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            await this.database.db.group.update({
                where: { id: data.groupID, organization: data.organization, platform, creatorID: user.id },
                data: { name: data.name },
            });

            return "group rename successful";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting group");
            }
        }
    }

    async all(token: string, platform: string, organization: string): Promise<GroupDetails[] | undefined>{
        try{
            jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const init = await this.database.db.group.findMany({
                where: { organization, platform },
                include: { chats: true, members: { include: { user: true, group: false } } }
            });

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting group");
            }
        }   
    }

    async add(token: string, platform: string, data: { userID: string, groupID: number, organization?: string} ): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const member = await this.database.db.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: user.id }  }
            });

            if(member){
                if(member.role === "admin"){
                    const init = await this.database.db.member.create({
                        data: { groupID: data.groupID, userID: data.userID },
                    });
                    
                }
            }

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting group");
            }
        }   
    }

    async delete(token: string, data: { groupID: number }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            await this.database.db.group.delete({
                where: { id: data.groupID, creatorID: user.id },
            });

            return "Group deleted successfull";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting group");
            }
        }
    }
}

export default Group;