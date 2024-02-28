import express from "express";
import userRouter from "./users";
import groupRouter from "./groups";
import chatRouter from "./chats";

const api = express();

api.use("/users", userRouter);
api.use("/groups", groupRouter);
api.use("/chats", chatRouter);

export default api;