import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";
import { strip } from "../utils";

export interface UserDetails{
    id: string
    name: string,
    surname: string,
    username?: string | null,
    email?: string | null,
    phone?: string | null,
}

class User{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { token: string, platform: string, organization?: string }): Promise<UserDetails | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const init = await this.database.db.user.upsert({
                where: { id: user.id }, 
                update: { lastSeen: new Date()  }, 
                create: { platform: data.platform, organization: data.organization, id: user.id, name: user.name, surname: user.surname, email: user.email, phone: user.phone } });

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }

    async delete(data: { token: string, platform: string, organization?: string }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            await this.database.db.user.delete({ where: { id: user.id, platform: data.platform, organization: data.organization } });

            return "user was deleted successfully";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
            }
        }
    }
}

export default User;