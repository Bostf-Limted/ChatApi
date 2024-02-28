import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../../config";
import { Chats } from "../../models";

const chatRouter = express.Router();

chatRouter.post("/", async(req, res) =>{
    if(req.body.message && ( req.body.recieverID || req.body.groupID )){
        const model = new Chats.ChatModel();
        const group = await model.create(req.body);

        if(group){
            return res.status(HttpStatusCode.Created).send(group);
        }
        return DBManager.instance().errorHandler.display(res);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

chatRouter.put("/", async(req, res) =>{
    if(req.body.message && req.body.chatID && ( req.body.channelID || req.body.groupID ) ){
        const model = new Chats.ChatModel();
        const group = await model.update(req.body);

        if(group){
            return res.status(HttpStatusCode.Accepted).send(group);
        }
        return DBManager.instance().errorHandler.display(res);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default chatRouter;