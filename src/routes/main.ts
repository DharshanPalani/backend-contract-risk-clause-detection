import { Router } from "express";
import type { Request, Response } from "express";
import { MainController } from "../controllers/main.js";
import { requireAuth } from "../middleware/auth.js";

const mainRouter = Router();
const mainController = new MainController();

mainRouter.post(
  "/review",
  requireAuth,
  mainController.upload.single("pdf"),
  mainController.review.bind(mainController),
);

mainRouter.get("/hello", (_request: Request, response: Response) => {
  response.send("Yoo");
});

export default mainRouter;
