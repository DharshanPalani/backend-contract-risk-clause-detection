import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserService } from "../services/user.js";
import { OAuthService } from "../services/oauth.js";
import { AuthService } from "../services/auth.js";

export class AuthController {
  private userService = new UserService();
  private oauthService = new OAuthService();
  private authService = new AuthService();

  // --------------------------------------------------
  // GET /auth/google
  // --------------------------------------------------

  googleAuth = (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(request, response, next);
  };

  // --------------------------------------------------
  // GET /auth/google/callback
  // --------------------------------------------------

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
          // Find existing user or create a new one
          const dbUser = await this.userService.findOrCreateGoogleUser({
            googleId: user.googleId,
            email: user.email,
            name: user.name,
          });

          // Create temporary one-time OAuth code
          const code = await this.oauthService.createAuthCode(dbUser.user_id);

          const frontendUrl =
            process.env.FRONTEND_URL ?? "http://localhost:5173";

          // Redirect to frontend callback
          return response.redirect(
            `${frontendUrl}/callback?code=${encodeURIComponent(code)}`,
          );
        } catch (error) {
          console.error("Authentication error:", error);

          return response.status(500).json({
            status: "error",
            message: "Authentication failed",
          });
        }
      },
    )(request, response, next);
  };

  // --------------------------------------------------
  // POST /auth/verify
  // --------------------------------------------------

  verify = async (request: Request, response: Response) => {
    const { code } = request.body;

    if (!code || typeof code !== "string") {
      return response.status(400).json({
        status: "error",
        message: "Code is required",
      });
    }

    try {
      // Verify and consume the temporary Redis code
      const userId = await this.oauthService.verifyAuthCode(code);

      if (!userId) {
        return response.status(401).json({
          status: "error",
          message: "Invalid or expired code",
        });
      }

      // Create JWT
      const token = this.authService.createToken(userId);

      // Store JWT in HTTP-only cookie
      response.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000,
        path: "/",
      });

      return response.status(200).json({
        status: "good",
      });
    } catch (error) {
      console.error("OAuth verification error:", error);

      return response.status(500).json({
        status: "error",
        message: "Authentication verification failed",
      });
    }
  };

  // --------------------------------------------------
  // GET /auth/me
  // --------------------------------------------------

  me = async (request: Request, response: Response) => {
    try {
      const token = request.cookies?.auth_token;

      if (!token) {
        return response.status(401).json({
          status: "error",
          message: "Not authenticated",
        });
      }

      // Verify JWT
      const userId = this.authService.verifyToken(token);

      if (!userId) {
        return response.status(401).json({
          status: "error",
          message: "Invalid or expired session",
        });
      }

      // Get actual user from PostgreSQL
      const user = await this.userService.findById(userId);

      if (!user) {
        return response.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return response.status(200).json({
        status: "good",
        user,
      });
    } catch (error) {
      console.error("Auth me error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to retrieve authenticated user",
      });
    }
  };
}
