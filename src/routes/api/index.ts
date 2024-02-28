import express from "express";
import developerRouter from "./developer";
import projectsRouter from "./projects";
import accessKeyRouter from "./acess-keys";

const api = express();

api.use("/developer", developerRouter);
api.use("/project", projectsRouter);
api.use("/access", accessKeyRouter);

export default api;