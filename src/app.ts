import bodyParser from "body-parser";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from "express";
import logger from 'jet-logger';
import path from 'path';
import 'express-async-errors';
import vhost from "vhost";

import HttpStatusCodes from "./constants/HttpStatusCodes";

import { RouteError } from "./utils";
import morgan from "morgan";
import blimitedRouter from "./blimited/routes";
import academiaRouter from "./academia/routes";

const api = express();

// parse application/x-www-form-urlencoded
api.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
api.use(bodyParser.json());
api.use(cookieParser());

api.enable('trust proxy');

if (process.env.NODE_ENV === "development") {
    api.use(morgan('dev'));
}

const whitelist = ["http://localhost:3010", "http://localhost:3020"];
const corsOptions = {
    credentials: true,
    origin: function(origin: any, callback: any){
        console.log(origin);
        if(!origin){
            return callback(null, true);
        }else if(whitelist.indexOf(origin) === -1){
            return callback(new Error("not allowed by CORS"), false);
        }
        return callback(null, true);
    }
}
api.use(cors(corsOptions));

// Add error handler
api.use(( err: Error, _: Request, res: Response, next: NextFunction,) => {
    if (process.env.NodeEnv !== "Production") {
        logger.err(err, true);
    }

    let status = HttpStatusCodes.BAD_REQUEST;
    if (err instanceof RouteError) {
        status = err.status;
    }
    return res.status(status).json({ error: err.message });
});


api.use("/res", express.static(path.resolve(__dirname, 'public'))); 
api.use("/", blimitedRouter);
api.use("/academia", academiaRouter);

/*app.listen(process.env.PORT, () => {
    console.log(`Node server started running at post: ${process.env.PORT}`);
});*/

const app = express();

// Use vhost middleware
app.use(vhost(/^api\..*/, api)); // API Subdomain
// Main Domain (Frontend)
app.use(express.static(path.join(__dirname, 'website')));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'website/index.html'));
});

export default app;