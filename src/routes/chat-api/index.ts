import express from "express";
import expressWS from "express-ws";
import jetLogger from "jet-logger";

import userRouter from "./users";
import groupRouter from "./groups";
import chatRouter from "./chats";

const api = express();

const { app: wsApp } = expressWS(api);

wsApp.ws("/", (ws, req) =>{
    jetLogger.info("user connected");
    ws.on("message", (message: string)=>{

    });

    ws.on("close", ()=>{
        jetLogger.info("user left");
    });
});


api.use("/users", userRouter);
api.use("/groups", groupRouter);
api.use("/chats", chatRouter);

export default api;