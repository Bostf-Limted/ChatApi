import { HttpStatusCode } from "axios";
import { Response } from "express";

interface Err{
    error: string, message: string
}

class ErrorHandler{
    private errors: { code : HttpStatusCode, error: Err}[];
    
    public constructor(){
        this.errors = [];
    }
    
    add(code: HttpStatusCode, error: string, message: string): void{
        const init: Err = { error: error, message: message };
        this.errors.push({ code, error: init });
    }
    
    display(response: Response){
        if(this.errors.length > 0){
            let first = this.errors[0];
            this.errors.forEach((value) =>{
                console.log(value.error.error + "\n");
            });
            this.errors = [];
            return response.status(first.code).json({"message": first.error.message});
        }
        this.errors = [];
        return response.status(HttpStatusCode.InternalServerError).json({"message": "obsolute server breakdown"});
    }
    
    has_error(): boolean{
        return this.errors.length > 0;
    }
}

export default ErrorHandler;