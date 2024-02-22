import bodyParser from "body-parser";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction } from "express";
import logger from 'jet-logger';
import 'express-async-errors';

import { RouteError } from "./utils";
import morgan from "morgan";
import { HttpStatusCode } from "axios";
import routes from "./routes";

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

    let status = HttpStatusCode.BadGateway;
    if (err instanceof RouteError) {
        status = err.status;
    }
    return res.status(status).json({ error: err.message });
});

api.use(routes);

export default api;