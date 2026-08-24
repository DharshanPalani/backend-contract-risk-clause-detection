import type { Request, Response, NextFunction } from "express";
import passport from "passport";

export class AuthController {
  googleAuth = (request: Request, response: Response, next: NextFunction) => {
    console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
    console.log(
      "GOOGLE_CLIENT_SECRET exists:",
      !!process.env.GOOGLE_CLIENT_SECRET,
    );
    console.log("CALLBACK_URL:", process.env.CALLBACK_URL);

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
      (err: any, user: any) => {
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

        console.log("Authenticated Google user:", user);

        return response.status(200).json({
          status: "good",
          email: user,
        });
      },
    )(request, response, next);
  };
}
