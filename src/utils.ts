import { Response } from "express";
import axios, { HttpStatusCode } from "axios";
import { env } from "process";
import ErrorHandler from "./config/error";

export default function uuid() {
    var h='0123456789abcdef';
    var k='xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx';
    /* same as e4() below */

    var u='',i=0,rb=Math.random()*0xffffffff|0;
    while(i++<36) {
        var c=k[i-1],r=rb&0xf,v=c=='x'?r:(r&0x3|0x8);
        u+=(c=='-'||c=='4')?c:h[v];rb=i%8==0?Math.random()*0xffffffff|0:rb>>4
    }
    return u
}

export const report = (res: Response, fallback: string, errorHandler: ErrorHandler) =>{
    if(errorHandler.has_error()){
        return errorHandler.display(res);
    }else{
        return res.status(500).send({message: fallback});
    }
}

export const toSlurg = (name: string) =>{
    let init = name.toLocaleLowerCase();
    return init.replace(" ", "_");
}

export class RouteError extends Error {
    status: HttpStatusCode;
    constructor(status: HttpStatusCode, message: string) {
      super(message);
      this.status = status;
    }
}

export const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true, 
	baseURL: env.HOME_URL, }); 