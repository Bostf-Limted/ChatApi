import express from "express";
import { axiosInstance } from "../utils";
import { env } from "process";
import { HttpStatusCode } from "axios";
import { User } from "../models";
import { DBManager } from "../config";

const userRouter = express.Router();

userRouter.post("/", async(req, res) =>{
    if(req.body.platform && req.body.name && req.body.surname && req.body.phone && req.body.username && req.body.email && req.body.password){
        const response = await axiosInstance.post("/users", req.body, { headers: { Cookie: `key=${env.KEY}` } });
        if(response.status === HttpStatusCode.Created){
            await new User().create(response.data.id);
            if(!DBManager.instance().errorHandler.has_error()){
                res.cookie(req.body.platform, response.data.sessionID, {
                    expires: new Date(
                        Date.now() + Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN || `7`) * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true,
                    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
                });
                return res.status(HttpStatusCode.Created).send(response.data);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(response.status).send(response.data);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

userRouter.get("/", async(req, res) =>{
    const response = await axiosInstance.get("/", { headers: { Cookie: `${req.headers.cookie};key=${env.KEY}` }});
    if(response.status === HttpStatusCode.Ok){
        await new User().create(response.data.id);
        if(!DBManager.instance().errorHandler.has_error()){
            return res.status(HttpStatusCode.Ok).send(response.data);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(response.status).send(response.data);
});

userRouter.post("/login", async(req, res) =>{
    if(req.body.platform && (req.body.phone || req.body.username || req.body.email) && req.body.password){
        const response = await axiosInstance.post("/users/login", ...req.body, { headers: { Cookie: `key=${env.KEY}` } });
        if(response.status === HttpStatusCode.Ok){
            await new User().create(response.data.id);
            if(!DBManager.instance().errorHandler.has_error()){
                res.cookie(req.body.platform, response.data.sessionID, {
                    expires: new Date(
                        Date.now() + Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN || `7`) * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true,
                    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
                });
                return res.status(HttpStatusCode.Ok).send(response.data);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(response.status).send(response.data);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default userRouter;
