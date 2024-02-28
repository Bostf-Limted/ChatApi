import { Developer } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";
import { HttpStatusCode } from "axios";

class DeveloperModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { token: string }): Promise<Developer | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const init = await this.database.db.developer.create({
                data: { id: user.id, name: user.name, surname: user.surname, email: user.email, phone: user.phone } });

            return init;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating user");
        }
    }

    async delete(data: { token: string }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            await this.database.db.developer.delete({ where: { id: user.id } });

            return "developer was deleted successfully";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting user");
        }
    }

    async get(data: { token: string }): Promise<Developer | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const developer = await this.database.db.developer.findUnique({
                where: { id: user.id },
                include:{ projects: { include: { keys: false } } }
            });

            if(developer){
                return developer;
            }
            this.database.errorHandler.add(HttpStatusCode.NotFound, ``, "user not found");
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when initializing user");
        }
    }
}

export default DeveloperModel;