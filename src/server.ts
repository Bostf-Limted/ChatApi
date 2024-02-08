import dotenv from 'dotenv';

dotenv.config();
import logger from 'jet-logger';

import api from './app';
import { DBManager } from './config/database';

const SERVER_START_MSG = ('Express server started on port: ' + process.env.PORT);
const server = api.listen(process.env.PORT, () =>{
  logger.info(SERVER_START_MSG);
  DBManager.instance();
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);});

/*process.on('unhandledRejection', (err: any) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});*/

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
