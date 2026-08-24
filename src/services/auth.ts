import jwt from "jsonwebtoken";

interface AuthPayload {
  user_id: number;
}

export class AuthService {
  createToken(userId: number): string {
    return jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      },
    );
  }

  verifyToken(token: string): number | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

      if (!decoded.user_id) {
        return null;
      }

      return decoded.user_id;
    } catch {
      return null;
    }
  }
}
