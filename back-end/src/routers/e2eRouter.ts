import { Router } from "express";
import { e2eController } from "../controllers/e2eController";

const e2eRouter = Router();

e2eRouter.post("/e2e/reset", e2eController.reset);

export default e2eRouter;
