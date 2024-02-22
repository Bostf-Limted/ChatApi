import express from "express";
import { axiosInstance } from "../utils";
import { env } from "process";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import { UserModel } from "../models";

const userRouter = express.Router();

userRouter.post("/", async(req, res) =>{
    if(req.body.platform){
        if(req.cookies[`${req.body.platform}_access`]){
            const token = req.cookies[`${req.body.platform}_access`];

            const model = new UserModel();
            const user = await model.create({ token, platform: req.body.platform, organization: req.body.oraganization });

            if(user){
                return res.status(HttpStatusCode.Created).send(user);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(HttpStatusCode.Unauthorized).send({message: "acess token expired, try refreshing or login again"});
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

userRouter.get("/", async(req, res) =>{
    if(req.query.platform){
        if(req.cookies[`${req.query.platform}_access`]){
            const token = req.cookies[`${req.query.platform}_access`];

            const model = new UserModel();
            const response = await model.get({ token, platform: req.query.platform as string, organization: req.query.oraganization as string });

            if(response){
                return res.status(HttpStatusCode.Ok).send(response);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(HttpStatusCode.Unauthorized).send({message: "acess token expired, try refreshing or login again"});
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default userRouter;
