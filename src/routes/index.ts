import express from "express";
import userRouter from "./users";
import groupRouter from "./groups";
import chatRouter from "./chats";
import path from "path";
import nunjucks from "nunjucks";
const routes = express();


routes.use("/users", userRouter);
routes.use("/groups", groupRouter);
routes.use("/chats", chatRouter);

routes.use("/assets", express.static(path.resolve(__dirname, "../assets")));

nunjucks.configure(path.resolve(__dirname, "../views"), {
    express: routes,
    autoescape: true,
    noCache: false,
    watch: true
});

routes.get("/", async(req, res) =>{
    res.redirect("/overview");
});

routes.get("/:page", async(req, res) =>{
    res.render("index.njk", { title : "Chat API", page: req.params.page });
});


export default routes;