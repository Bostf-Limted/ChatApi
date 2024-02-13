import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface UserDetails{
    id: string
    name: string,
    surname: string,
    username?: string
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
            const { user } = jwt.verify(token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            await this.database.db.user.upsert({
                where: { id: user.id }, 
                update: { lastSeen: new Date()  }, 
                create: { id: user.id, name: user.name, surname: user.surname, email: user.email, phone: user.phone } });
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }
}

export default User;