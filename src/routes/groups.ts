import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import { GroupModel } from "../models";

const groupRouter = express.Router();

groupRouter.post("/", async(req, res) =>{
    if(req.body.platform && req.body.name){
        if(req.cookies[`${req.body.platform}_access`]){
            const token = req.cookies[`${req.body.platform}_access`];

            const model = new GroupModel();
            const group = await model.create(token, req.body.platform, { ...req.body });

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

groupRouter.put("/", async(req, res) =>{
    if(req.body.platform && req.body.groupID && req.body.name){
        if(req.cookies[`${req.body.platform}_access`]){
            const token = req.cookies[`${req.body.platform}_access`];

            const model = new GroupModel();
            const group = await model.rename(token, req.body.platform, { ...req.body });

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

groupRouter.delete("/", async(req, res) =>{
    if(req.body.platform && req.body.groupID){
        if(req.cookies[`${req.body.platform}_access`]){
            const token = req.cookies[`${req.body.platform}_access`];

            const model = new GroupModel();
            const group = await model.delete(req.body.platform, token, { ...req.body });

            if(group){
                return res.status(HttpStatusCode.Ok).send(group);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(HttpStatusCode.Unauthorized).send({message: "acess token expired, try refreshing or login again"});
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default groupRouter;