import type { Request, Response, NextFunction } from "express";
import passport from "passport";

export class AuthController {
  googleAuth = (request: Request, response: Response, next: NextFunction) => {
    try {
      console.log("=== GOOGLE AUTH HIT ===");

      console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);

      console.log(
        "GOOGLE_CLIENT_SECRET exists:",
        !!process.env.GOOGLE_CLIENT_SECRET,
      );

      console.log("CALLBACK_URL:", process.env.CALLBACK_URL);

      return passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
      })(request, response, next);
    } catch (error) {
      console.error("=== GOOGLE AUTH ERROR ===", error);

      return response.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  googleCallback = (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    return passport.authenticate(
      "google",
      { session: false },
      (err: any, user: any) => {
        if (err) {
          console.error("Google OAuth error:", err);

          return response.status(500).json({
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }

        if (!user) {
          return response.status(401).json({
            status: "error",
            message: "Google authentication failed",
          });
        }

        return response.status(200).json({
          status: "good",
          email: user,
        });
      },
    )(request, response, next);
  };
}
