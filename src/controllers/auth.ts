import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserService } from "../services/user.js";

export class AuthController {
  private userService = new UserService();

  googleAuth = (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(request, response, next);
  };

  googleCallback = (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    passport.authenticate(
      "google",
      { session: false },
      async (err: any, user: any) => {
        if (err) {
          console.error("Google OAuth error:", err);

          return response.status(500).json({
            status: "error",
            message: "Google authentication failed",
          });
        }

        if (!user) {
          return response.status(401).json({
            status: "error",
            message: "Google authentication failed",
          });
        }

        try {
          const dbUser = await this.userService.findOrCreateGoogleUser({
            googleId: user.googleId,
            email: user.email,
            name: user.name,
          });

          const code = 1234;

          return response.redirect(
            `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/callback?code=${encodeURIComponent(code)}`,
          );

          return response.status(200).json({
            status: "good",
            user: dbUser,
          });
        } catch (error) {
          console.error("Database error:", error);

          return response.status(500).json({
            status: "error",
            message: "Failed to create user",
          });
        }
      },
    )(request, response, next);
  };
}
