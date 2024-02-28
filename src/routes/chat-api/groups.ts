import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../../config";
import { Chats } from "../../models";

const groupRouter = express.Router();

groupRouter.post("/", async(req, res) =>{
    if(req.body.name){
        const model = new Chats.GroupModel();
        const group = await model.create(req.body);

        if(group){
            return res.status(HttpStatusCode.Created).send(group);
        }
        return DBManager.instance().errorHandler.display(res);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

groupRouter.put("/", async(req, res) =>{
    if(req.body.groupID && req.body.name){
        const model = new Chats.GroupModel();
        const group = await model.rename(req.body);

        if(group){
            return res.status(HttpStatusCode.Accepted).send(group);
        }
        return DBManager.instance().errorHandler.display(res);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

groupRouter.delete("/", async(req, res) =>{
    if(req.body.groupID){
        const model = new Chats.GroupModel();
        const group = await model.delete(req.body);

        if(group){
            return res.status(HttpStatusCode.Ok).send(group);
        }
        return DBManager.instance().errorHandler.display(res);
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default groupRouter;