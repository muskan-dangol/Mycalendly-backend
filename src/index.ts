import express from "express";
import type { Application, Request, Response } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/index";

dotenv.config();

const app: Application = express();
const httpsServer = createServer(app);
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);

httpsServer.keepAliveTimeout = 310000;
httpsServer.headersTimeout = 315000;

// middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", router);

httpsServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
