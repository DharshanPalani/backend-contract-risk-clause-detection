import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.js";

const authService = new AuthService();

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const token = request.cookies?.auth_token;

    if (!token) {
      return response.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const userId = authService.verifyToken(token);

    if (!userId) {
      return response.status(401).json({
        status: "error",
        message: "Invalid or expired session",
      });
    }

    // Keep it as any as requested
    (request as any).user = {
      userId,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return response.status(401).json({
      status: "error",
      message: "Authentication failed",
    });
  }
}
