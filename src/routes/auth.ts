import { Router } from "express";
import { AuthController } from "../controllers/auth.js";

const authRouter = Router();
const authController = new AuthController();

authRouter.get("/google", authController.googleAuth);

authRouter.get("/google/callback", authController.googleCallback);

authRouter.post("/verify", authController.verify);

authRouter.get("/me", authController.me);

authRouter.post("/logout", authController.logout);

export default authRouter;
