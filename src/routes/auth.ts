import { Router } from "express";
import { AuthController } from "../controllers/auth.js";

const authRouter = Router();
const authController = new AuthController();

authRouter.get("/google", authController.googleAuth);

authRouter.get("/google/callback", authController.googleCallback);

authRouter.post("/verify", authController.verify);

authRouter.get("/me");

export default authRouter;
