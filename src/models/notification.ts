import jwt, { JwtPayload } from "jsonwebtoken";
import { DBManager } from "../config";
import Database from "../config/database";
import { Notification } from "@prisma/client";
import { HttpStatusCode } from "axios";

class NotificationModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async seen(data: { token: string, notificationID: number }): Promise<Notification | undefined>{
        try{
            const { user } = jwt.verify(data.token, process.env.PRIVATE_ACCESS_TOKEN || "bobby_access" ) as JwtPayload;

            const notification = await this.database.db.notification.update({ 
                where: {id: data.notificationID,  recieverID: user.id },
                data: { received: true },
            });
            return notification;
        }catch(error){
            if(error instanceof jwt.TokenExpiredError){
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
            }else{
                this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when updating notification");
            }
        }
    }
}

export default NotificationModel;