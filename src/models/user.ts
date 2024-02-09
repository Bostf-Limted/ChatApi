import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "process";

export interface UserDetails{

    name?: string,
    surname?: string,
    email?: string,
    phone?: string,
}

class User{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(token: string): Promise<void>{
        try{
            const details = jwt.verify(token, env.SECRET || "Bobby", { algorithms: ["RS256"] }) as JwtPayload;
            await this.database.db.user.upsert({ 
                where: { id: details.id }, 
                update: { lastSeen: new Date()  }, 
                create: { id: details.id, name: details.name, surname: details.surname, email: details.email, phone: details.phone } });
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }
}

export default User;