import redis from "../config/redis.js";

export class OAuthRepository {
  async saveAuthCode(code: string, userId: number, expiresInSeconds = 60) {
    await redis.set(`oauth:code:${code}`, userId.toString(), {
      ex: expiresInSeconds,
    });
  }

  async getAuthCode(code: string) {
    return redis.get<string>(`oauth:code:${code}`);
  }

  async deleteAuthCode(code: string) {
    await redis.del(`oauth:code:${code}`);
  }
}
