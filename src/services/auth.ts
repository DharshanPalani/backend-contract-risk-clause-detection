import jwt from "jsonwebtoken";

interface AuthPayload {
  user_id: number;
}

export class AuthService {
  createToken(userId: number): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
      {
        user_id: userId,
      },
      secret,
      {
        expiresIn: "1h",
      },
    );
  }

  verifyToken(token: string): number | null {
    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error("JWT_SECRET is not configured");
      }

      const decoded = jwt.verify(token, secret) as AuthPayload;

      if (!decoded.user_id || typeof decoded.user_id !== "number") {
        return null;
      }

      return decoded.user_id;
    } catch (error) {
      console.error("JWT verification error:", error);
      return null;
    }
  }
}
