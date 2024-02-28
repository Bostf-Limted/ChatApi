import express from "express";
import { axiosInstance } from "../../utils";
import { env } from "process";
import { HttpStatusCode } from "axios";
import { DBManager } from "../../config";
import { DeveloperModel } from "../../models";

const developerRouter = express.Router();

developerRouter.post("/", async(req, res) =>{
    const model = new DeveloperModel();
    const user = await model.create({ token: req.body.token });

    if(user){
        return res.status(HttpStatusCode.Created).send(user);
    }
    return DBManager.instance().errorHandler.display(res);
});

developerRouter.get("/", async(req, res) =>{
    const model = new DeveloperModel();
    const response = await model.get({ token: req.body.token });

    if(response){
        return res.status(HttpStatusCode.Ok).send(response);
    }
    return DBManager.instance().errorHandler.display(res);
});

developerRouter.delete("/", async(req, res) =>{
    const model = new DeveloperModel();
    const response = await model.delete({ token: req.body.token });

    if(response){
        return res.status(HttpStatusCode.Ok).send(response);
    }
    return DBManager.instance().errorHandler.display(res);
});

export default developerRouter;