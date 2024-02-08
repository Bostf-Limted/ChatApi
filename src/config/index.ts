import Database from "./database";
import ErrorHandler from "./error";

class DBManager{
    private static db: Database;

    private constructor(){}

    static instance = () =>{
        if(!DBManager.db){
            DBManager.db = new Database(new ErrorHandler());
            DBManager.db.connect();
        }
        return DBManager.db;
    }

    static disponse = () =>{
        if(DBManager.db){
            DBManager.db.db.$disconnect();
        }
    }
}

export { DBManager };