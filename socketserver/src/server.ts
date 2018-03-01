import * as express from "express";
import * as path from "path";

export class Server {

  public app: express.Application;
  public static bootstrap(): Server {
    return new Server();
  }

  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config(); 
  }

  public config() {
    //add static paths
    this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use('/node_modules', express.static(path.join(__dirname, "../node_modules")));
  }
}