import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../../config";
import { AccessKeyModel } from "../../models";

const accessKeyRouter = express.Router();

accessKeyRouter.post("/", async(req, res) =>{
    if(req.body.token && req.body.projectID){
        const model = new AccessKeyModel();
        const access = await model.create(req.body);

        if(access){
            return res.status(HttpStatusCode.Created).send(access);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({ message: "bad or invalid request to server"});
});

accessKeyRouter.put("/enable", async(req, res) =>{
    if(req.body.key && req.body.enable){
        const model = new AccessKeyModel();
        const access = await model.enable(req.body);

        if(access){
            return res.status(HttpStatusCode.Accepted).send(access);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({ message: "bad or invalid request to server"});
});

accessKeyRouter.get("/:id", async(req, res) =>{
    if(req.params.id){
        const model = new AccessKeyModel();
        const response = await model.all(Number.parseInt(req.params.id));

        if(response){
            return res.status(HttpStatusCode.Ok).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({ message: "bad or invalid request to server"});
});

accessKeyRouter.delete("/", async(req, res) =>{
    if(req.body.key){
        const model = new AccessKeyModel();
        const response = await model.delete(req.body);
        if(response){
            return res.status(HttpStatusCode.Ok).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({ message: "bad or invalid request to server"});
});

export default accessKeyRouter;