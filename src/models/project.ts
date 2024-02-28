import { Developer, Project } from "@prisma/client";
import { DBManager } from "../config";
import Database from "../config/database";
import jwt, { JwtPayload } from "jsonwebtoken";
import { HttpStatusCode } from "axios";

class ProjectModel {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { token: string, name: string, jwtAccessName: string, jwtAccessKey: string }): Promise<Project | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const init = await this.database.db.project.create({
                data: { developerID: user.id, name: data.name, jwtAccessKey: data.jwtAccessKey, jwtAccessName: data.jwtAccessKey },
                include: { keys: true }
            });

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating project");
            }
        }
    }

    async edit(data: { token: string, projectID: number, name?: string, jwtAccessName?: string, jwtAccessKey?: string }): Promise<Project | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            const init = await this.database.db.project.update({
                where: { developerID: user.id, id: data.projectID },
                data: { name: data.name, jwtAccessKey: data.jwtAccessKey, jwtAccessName: data.jwtAccessKey },
                include: { keys: true }
            });

            return init;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating project");
            }
        }
    }

    async delete(data: { token: string, projectID: number }): Promise<string | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;
            await this.database.db.project.delete({ where: { developerID: user.id, id: data.projectID } });

            return "project was deleted successfully";
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when deleting project");
            }
        }
    }

    async get(data: { token: string, projectID: number }): Promise<Project | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const project = await this.database.db.project.findUnique({
                where: { developerID: user.id, id: data.projectID },
                include:{  keys: true }
            });

            if(project){
                return project;
            }

            this.database.errorHandler.add(HttpStatusCode.NotFound, ``, "project not found");
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting project");
            }
        }
    }

    async all(data: { token: string }): Promise<Project[] | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const projects = await this.database.db.project.findMany({
                where: { developerID: user.id },
                include:{  keys: true }
            });

            return projects;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when getting projects");
            }
        }
    }
}

export default ProjectModel;