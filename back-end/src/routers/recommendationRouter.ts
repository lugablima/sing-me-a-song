import { Router } from "express";
import { recommendationController } from "../controllers/recommendationController";

const recommendationRouter = Router();

recommendationRouter.post("/recommendations", recommendationController.insert);
recommendationRouter.get("/recommendations", recommendationController.get);
recommendationRouter.get("/recommendations/random", recommendationController.random);
recommendationRouter.get("/recommendations/top/:amount", recommendationController.getTop);
recommendationRouter.get("/recommendations/:id", recommendationController.getById);
recommendationRouter.post("/recommendations/:id/upvote", recommendationController.upvote);
recommendationRouter.post("/recommendations/:id/downvote", recommendationController.downvote);

export default recommendationRouter;
