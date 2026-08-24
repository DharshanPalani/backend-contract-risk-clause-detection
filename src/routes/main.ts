import { Router } from "express";
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

mainRouter.get(
  "/reports",
  requireAuth,
  mainController.getReports.bind(mainController),
);

mainRouter.get(
  "/reports/:reportId",
  requireAuth,
  mainController.getReport.bind(mainController),
);

export default mainRouter;
