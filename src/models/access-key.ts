import { AccessKey, Project } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import uuid from "../utils";
import { HttpStatusCode } from "axios";

class AccessKeyModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { projectID: number}): Promise<AccessKey | undefined>{
        try{
            const key = uuid();
            return await this.database.db.accessKey.create({
                data: { projectID: data.projectID , key }
            });
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating access key");
        }
    }

    async get(data: { key: string }): Promise<AccessKey & { project: Project } | undefined>{
        try{
            const init = await this.database.db.accessKey.findUnique({
                where: { key: data.key }, include: { project: true }
            });
            
            if(init){
                return init;
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "invalid or expired access key");
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when authenicating access key");
        }
    }

    async enable(data: { key: string, enable: boolean }): Promise<AccessKey | undefined>{
        try{
            const init = await this.database.db.accessKey.update({
                where: { key: data.key }, data: { enabled: data.enable }
            });
            return init;

        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when authenicating access key");
        }
    }

    async delete(data: { key: string }): Promise<string | undefined>{
        try{
            await this.database.db.accessKey.delete({ where: { key: data.key } });
            
            return "access keys deletion successful";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting access key");
        }
    }

    async all(projectID: number): Promise<AccessKey[] | undefined>{
        try{
            const init = await this.database.db.accessKey.findMany({
                where: { projectID },
                include: { project: true }
            });
            
            return init
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when gathering access keys");
        }
    }
}

export default AccessKeyModel;