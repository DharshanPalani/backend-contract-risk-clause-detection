import { UserRepository } from "../repositories/user.js";

interface GoogleUserData {
  googleId: string;
  email: string;
  name: string;
}

export class UserService {
  private userRepository = new UserRepository();

  async findOrCreateGoogleUser(data: GoogleUserData) {
    const existingUser = await this.userRepository.findByGoogleId(
      data.googleId,
    );

    if (existingUser) {
      return existingUser;
    }

    return this.userRepository.createGoogleUser(data);
  }
}
