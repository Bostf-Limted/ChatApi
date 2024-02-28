import jwt, { JwtPayload } from "jsonwebtoken";
import { DBManager } from "../../config";
import Database from "../../config/database";
import { Notification } from "@prisma/client";
import { HttpStatusCode } from "axios";

class NotificationModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async seen(data: { projectID: number, token: string, jwtAccessKey: string, notificationID: number }): Promise<Notification | undefined>{
        try{
            const { user } = jwt.verify(data.token, data.jwtAccessKey ) as JwtPayload;

            const notification = await this.database.db.notification.update({ 
                where: {id: data.notificationID,  recieverID: user.id, projectID: data.projectID },
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