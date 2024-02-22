import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import { ChatModel } from "../models";

const chatRouter = express.Router();

chatRouter.post("/", async(req, res) =>{
    if(req.body.platform && req.body.message && ( req.body.recieverID || req.body.groupID )){
        if(req.cookies[`${req.body.platform}_access`]){
            const token = req.cookies[`${req.body.platform}_access`];

            const model = new ChatModel();
            const group = await model.create(req.body.platform, token, req.body);

            if(group){
                return res.status(HttpStatusCode.Created).send(group);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(HttpStatusCode.Unauthorized).send({message: "acess token expired, try refreshing or login again"});
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

chatRouter.put("/", async(req, res) =>{
    if(req.body.platform && req.body.message && req.body.chatID && ( req.body.channelID || req.body.groupID ) ){
        if(req.cookies[`${req.body.platform}_access`]){
            const token = req.cookies[`${req.body.platform}_access`];

            const model = new ChatModel();
            const group = await model.update(req.body.platform, token, { ...req.body });

            if(group){
                return res.status(HttpStatusCode.Accepted).send(group);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(HttpStatusCode.Unauthorized).send({message: "acess token expired, try refreshing or login again"});
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default chatRouter;