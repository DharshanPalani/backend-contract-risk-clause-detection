import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.js";

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const requireAuth = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
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

    request.userId = userId;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return response.status(401).json({
      status: "error",
      message: "Authentication failed",
    });
  }
};
