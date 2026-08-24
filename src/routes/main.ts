import { Router } from "express";
import { MainController } from "../controllers/main.js";

const mainRouter = Router();
const mainController = new MainController();

mainRouter.post(
  "/review",
  mainController.upload.single("pdf"),
  mainController.review.bind(mainController),
);

export default mainRouter;
