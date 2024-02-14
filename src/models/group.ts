import { DBManager } from "../config";
import Database from "../config/database";
import { GroupChatDetails } from "./chat";

export interface GroupDetails{
    name : string,
    chats: GroupChatDetails[]
    organization?: string
}

class Group {
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }
}

export default Group;