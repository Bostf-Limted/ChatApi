import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../../config";
import { ProjectModel } from "../../models";

const projectsRouter = express.Router();

projectsRouter.post("/", async(req, res) =>{
    if(req.body.name && req.body.token && req.body.jwtAccessName && req.body.jwtAccessKey){
        const model = new ProjectModel();
        const user = await model.create(req.body);

        if(user){
            return res.status(HttpStatusCode.Created).send(user);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({ message: "bad or invalid request to server"});
});

projectsRouter.put("/", async(req, res) =>{
    if(req.body.projectID && (req.body.name || req.body.jwtAccessName || req.body.jwtAccessKey)){
        const model = new ProjectModel();
        const user = await model.edit(req.body);

        if(user){
            return res.status(HttpStatusCode.Created).send(user);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({ message: "bad or invalid request to server"});
});

projectsRouter.get("/", async(req, res) =>{
    const model = new ProjectModel();
    const response = await model.all({ token: req.body.token });

    if(response){
        return res.status(HttpStatusCode.Ok).send(response);
    }
    return DBManager.instance().errorHandler.display(res);
});

projectsRouter.get("/:id", async(req, res) =>{
    const model = new ProjectModel();
    const response = await model.get({ token: req.body.token, projectID: Number.parseInt(req.params.id) });

    if(response){
        return res.status(HttpStatusCode.Ok).send(response);
    }
    return DBManager.instance().errorHandler.display(res);
});

projectsRouter.delete("/:id", async(req, res) =>{
    const model = new ProjectModel();
    const response = await model.delete({ token: req.body.token, projectID: Number.parseInt(req.params.id) });

    if(response){
        return res.status(HttpStatusCode.Ok).send(response);
    }
    return DBManager.instance().errorHandler.display(res);
});

export default projectsRouter;