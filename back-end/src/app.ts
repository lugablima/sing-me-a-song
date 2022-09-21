import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import "express-async-errors";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import recommendationRouter from "./routers/recommendationRouter";
import e2eRouter from "./routers/e2eRouter";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(recommendationRouter);

if (process.env.NODE_ENV === "test") {
	app.use(e2eRouter);
}

app.use(errorHandlerMiddleware);

export default app;
