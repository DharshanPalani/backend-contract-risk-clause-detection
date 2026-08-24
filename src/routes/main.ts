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

mainRouter.post(
  "/reports/:reportId/highlights",
  mainController.generateHighlights.bind(mainController),
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

mainRouter.patch(
  "/reports/:reportId/close",
  requireAuth,
  mainController.closeReport.bind(mainController),
);

mainRouter.patch(
  "/reports/:reportId/restore",
  requireAuth,
  mainController.restoreReport.bind(mainController),
);

mainRouter.delete(
  "/reports/:reportId",
  requireAuth,
  mainController.deleteReport.bind(mainController),
);

export default mainRouter;
