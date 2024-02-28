import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../../config";
import { Chats } from "../../models";

const userRouter = express.Router();

userRouter.post("/", async(req, res) =>{
    const model = new Chats.UserModel();
    const user = await model.create(req.body);

    if(user){
        return res.status(HttpStatusCode.Created).send(user);
    }
    return DBManager.instance().errorHandler.display(res);
});

userRouter.get("/", async(req, res) =>{
    const model = new Chats.UserModel();
    const response = await model.get(req.body);

    if(response){
        return res.status(HttpStatusCode.Ok).send(response);
    }
    return DBManager.instance().errorHandler.display(res);
});

export default userRouter;