import express, { NextFunction, Request, Response } from "express";
import path from "path";
import nunjucks from "nunjucks";
import AccessKeyModel from "../models/access-key";
import { DBManager } from "../config";
import { HttpStatusCode } from "axios";
import chatApi from "./chat-api";
import jwt from "jsonwebtoken";
import jetLogger from "jet-logger";

const routes = express();

const chatAPIAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.key || req.params.key){
        const accessKey = await new AccessKeyModel().get(req.body.key || req.params.key);
        if(accessKey){
            if(!accessKey.enabled){
                return res.status(HttpStatusCode.Unauthorized).send({message: "access key has been disabled"});   
            }
            req.body.projectID = accessKey.projectID;
            req.body.jwtAccessKey = accessKey.project.jwtAccessKey;
            if(req.cookies[accessKey.project.jwtAccessName]){
                req.body.token = req.cookies[accessKey.project.jwtAccessName];

                try{
                    jwt.verify(req.body.token, req.body.jwtAccessKey );
                    next();
                }catch(error){
                    jetLogger.err(error);
                    if(error instanceof jwt.TokenExpiredError){
                        return res.status(HttpStatusCode.Unauthorized).send({message: "access token expired, try refreshing or login again"});
                    }else{
                        return res.status(HttpStatusCode.InternalServerError).send({message: "error encountered when authenticating user"});
                    }
                }
            }else{
                return res.status(HttpStatusCode.Unauthorized).send({message: "access token not found, try refreshing or login again"});
            }
        }else if(DBManager.instance().errorHandler.has_error()){
            return DBManager.instance().errorHandler.display(res);
        }
        return res.sendStatus(HttpStatusCode.InternalServerError).send({ message: "total server break down" });
    }
    return res.sendStatus(HttpStatusCode.BadRequest).send({ message: "you must specify access key" });
};

const APIAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies[`chatAPI_access`]){
        req.body.token = req.cookies[`chatAPI_access`];

        try{
            jwt.verify(req.body.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" );
            next();
        }catch(error){
            jetLogger.err(error);
            if(error instanceof jwt.TokenExpiredError){
                return res.status(HttpStatusCode.Unauthorized).send({message: "access token expired, try refreshing or login again"});
            }else{
                return res.status(HttpStatusCode.InternalServerError).send({message: "error encountered when authenticating user"});
            }
        }
    }
    return res.status(HttpStatusCode.Unauthorized).send({message: "access token expired, try refreshing or login again"});
};

routes.use("/api", APIAuthenication, chatApi);
routes.use("/auth", chatAPIAuthenication, chatApi);
routes.use("/assets", express.static(path.resolve(__dirname, "../assets")));

nunjucks.configure(path.resolve(__dirname, "views"), {
    express: routes,
    autoescape: true,
    noCache: false,
    watch: true
});

routes.get("/", async(req, res) =>{
    res.render("homepage.njk", { title : "Chat API | Home", year: new Date().getFullYear() });
});

routes.get("/docs", async(req, res) =>{
    res.render("docs.njk", { title : "Chat API | Documentation" });
});

routes.get("/signin", async(req, res) =>{
    res.render("signin.njk", { title : "Chat API | Signin" });
});

routes.get("/developer/:page", async(req, res) =>{
    res.render("developer.njk", { title : "Chat API | Daashboard", page: req.params.page });
});

export default routes;