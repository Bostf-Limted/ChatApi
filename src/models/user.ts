import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";

export interface UserDetails{
    name: string,
    surname: string,
    email: string,
    phone: string,
}

class User{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async check_users(id: string): Promise<boolean | undefined>{
        try{
            return await this.database.db.users.count({ where: { id }}) > 0;
        }catch(error){
            DBManager.instance().errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "user checking error");
        }
        return undefined;
    }

    async create(id: string): Promise<void>{
        try{
            await this.database.db.users.upsert({ 
                where: { id }, 
                update: { lastSeen: new Date()  }, 
                create: { id } });
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }
}

export default User;