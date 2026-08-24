import { Router } from "express";
import type { Response } from "express";
// import { MainController } from "../controllers/main.js";

const mainRouter = Router();
// const mainController = new MainController();

// mainRouter.post(
//   "/review",
//   mainController.upload.single("pdf"),
//   mainController.review.bind(mainController),
// );

mainRouter.get("/hello", (response: Response) => {
  response.send("Yoo");
});

export default mainRouter;
