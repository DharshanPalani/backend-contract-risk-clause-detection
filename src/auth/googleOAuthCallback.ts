import type { Request, Response, NextFunction } from "express";
import passport from "passport";

export class GoogleOAuth {
  googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      { session: false },
      (err: any, email: string) => {
        if (err || !email) {
          return res.redirect("/error");
        }
      },
    )(req, res, next);
  };
}
