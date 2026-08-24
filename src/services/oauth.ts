import crypto from "node:crypto";
import { OAuthRepository } from "../repositories/oauth.js";

export class OAuthService {
  private oauthRepository = new OAuthRepository();

  async createAuthCode(userId: number) {
    const code = crypto.randomUUID();

    await this.oauthRepository.saveAuthCode(code, userId);

    return code;
  }

  async verifyAuthCode(code: string) {
    const userId = await this.oauthRepository.getAuthCode(code);

    if (!userId) {
      return null;
    }

    await this.oauthRepository.deleteAuthCode(code);

    return Number(userId);
  }
}
