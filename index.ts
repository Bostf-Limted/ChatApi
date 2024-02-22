import express, { Express, Request, Response, NextFunction } from "express";
import logger from 'jet-logger';

const app: Express = express();

const port = Number.parseInt(process.env.PORT || "5000");
const SERVER_START_MSG = ('Express server started on port: ' + port);

app.use(express.json());
app.get("/", async (request: Request, response: Response, next: NextFunction): Promise<void> =>{
  try{
    response.status(200).json({
      message: "Hurrary !! we create our first server on bunjs",
      success: true
    }); 
  }catch(error: unknown){
    next(new Error((error as Error).message));
  }
});

const server =  app.listen(port,()=>{
    logger.info(SERVER_START_MSG);
});

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    console.log(err);
    process.exit(1);});
  
  process.on('unhandledRejection', (err: any) => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
          process.exit(1);
      });
  });
  
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  }); 