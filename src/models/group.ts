import jwt, { JwtPayload } from "jsonwebtoken";
import { DBManager } from "../config";
import Database from "../config/database";
import { HttpStatusCode } from "axios";
import { Group, Member } from "@prisma/client";

class GroupModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(token: string, platform: string, data: { name: string, organization?: string }): Promise<Group | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const exists = await this.database.db.group.findMany({
                where: { platform, name: data.name, organization: data.organization, creatorID: user.id },
            });

            if(exists.length > 0){
                this.database.errorHandler.add(HttpStatusCode.AlreadyReported, ``, "group already exists");
            }else{
                const init = await this.database.db.group.create({
                    data: { platform, name: data.name, organization: data.organization, creatorID: user.id },
                });
    
                await this.database.db.member.create({
                    data: {  groupID: init.id, userID: init.creatorID, role: "admin" }
                });
                return  init;
            }
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

            const members = await this.database.db.member.findMany({ where:{ groupID: data.groupID }, include: { group: true } });

            await this.database.db.group.update({
                where: { id: data.groupID, organization: data.organization, platform, creatorID: user.id },
                data: { name: data.name },
            });

            members.forEach(async  (member)=>{
                if(user.id !== member.userID){
                    await this.database.db.notification.create({
                        data: { 
                            groupID: data.groupID, senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                            alert: `${user.name} renamed the group from ${member.group.name} to ${data.name}`,
                        }
                    });
                }
            });

            return "group rename successful";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when renaming the group");
            }
        }
    }

    async all(token: string, platform: string, organization: string): Promise<Group[] | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const init = await this.database.db.group.findMany({
                where: { organization, platform, OR: [ { creatorID: user.id }, { members: { some: { userID: user.id } } } ]  },
                include: { chats: { orderBy: { createdAt: "desc" } }, members: { include: { user: true, group: false } } },
                orderBy: { lastCommunicated: "desc" }
            });

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when listing the group you  belong to");
            }
        }   
    }

    async organization(token: string, platform: string, organization: string): Promise<Group[] | undefined>{
        try{
            jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const init = await this.database.db.group.findMany({
                where: { organization, platform },
                include: { chats: true, members: { include: { user: true, group: false } } },
                orderBy: { lastCommunicated: "desc" }
            });

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting list groups in the oraganization");
            }
        }   
    }

    async add(platform: string, token: string, data: { userID: string, groupID: number, organization?: string} ): Promise<Member | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const admin = await this.database.db.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: user.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "admin"){
                    const init = await this.database.db.member.create({
                        data: { groupID: data.groupID, userID: data.userID },
                        include: { user: true }
                    });

                    await this.database.db.notification.create({
                        data: {
                            groupID: data.groupID, senderID: user.id, recieverID: init.userID, platform, organization: data.organization,
                            alert: `${user.name} added you to the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.db.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(user.id !== member.userID && member.userID !== data.userID){
                            await this.database.db.notification.create({
                                data: {
                                    groupID: data.groupID, senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                                    alert: `${user.name} added ${init.user.name} to the ${admin.group.name} group`,
                                }
                            });
                        }
                    });

                    return init;
                }else{
                    this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "only admins are allowed to add user to a group");    
                }
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when adding user to this group");
            }
        }   
    }

    async remove(platform: string, token: string, data: { userID: string, groupID: number, organization?: string} ): Promise<Member | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const admin = await this.database.db.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: user.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "admin"){
                    const init = await this.database.db.member.delete({
                        where: { userID_groupID: { groupID: data.groupID, userID: data.userID } },
                        include: { user: true }
                    });

                    await this.database.db.notification.create({
                        data: {
                            groupID: data.groupID, senderID: user.id, recieverID: init.userID, platform, organization: data.organization,
                            alert: `${user.name} removed you from the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.db.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(user.id !== member.userID){
                            await this.database.db.notification.create({
                                data: {
                                    groupID: data.groupID, senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                                    alert: `${user.name} removed ${init.user.name} from the ${admin.group.name} group`,
                                }
                            });
                        }
                    });

                    return init;
                }else{
                    this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "only admins are allowed to remove users from a group");    
                }
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when removing user from the group");
            }
        }   
    }

    async assign(platform: string, token: string, data: { userID: string, groupID: number, organization?: string, role: string} ): Promise<Member | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const admin = await this.database.db.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: user.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "admin"){
                    const init = await this.database.db.member.upsert({
                        where: { userID_groupID: {groupID: data.groupID, userID: data.userID} },
                        create: { groupID: data.groupID, userID: data.userID, role: data.role },
                        update: { role: data.role },
                        include: { user: true }
                    });

                    await this.database.db.notification.create({
                        data: {
                            groupID: data.groupID, senderID: user.id, recieverID: init.userID, platform, organization: data.organization,
                            alert: `${user.name} changed your role to ${data.role} in the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.db.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(user.id !== member.userID && member.userID !== data.userID){
                            await this.database.db.notification.create({
                                data: {
                                    groupID: data.groupID, senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                                    alert: `${user.name} changed ${init.user.name} role to ${data.role} in the ${admin.group.name} group`,
                                }
                            });
                        }
                    });

                    return init;

                }else{
                    this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "only admins are allowed to assign roles users in a group");    
                }
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when assigning user role");
            }
        }   
    }

    async delete(platform: string, token: string, data: { groupID: number, organization?: string }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const admin = await this.database.db.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: user.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "admin"){
                    const members = await this.database.db.member.findMany({ where:{ groupID: data.groupID } });
                    await this.database.db.group.delete({
                        where: { id: data.groupID, creatorID: user.id },
                        include: { members: true, chats: true }
                    });

                    members.forEach(async  (member)=>{
                        if(user.id !== member.userID){
                            await this.database.db.notification.create({
                                data: {
                                    senderID: user.id, recieverID: member.userID, platform, organization: data.organization,
                                    alert: `${user.name} deleted ${admin.group.name} group`,
                                }
                            });
                        }
                    });
                    return "Group deleted successfull";
                }else{
                    this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "only admins are allowed to assign roles users in a group");    
                }
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting group");
            }
        }
    }
}

export default GroupModel;