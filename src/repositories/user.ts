import pool from "../config/db.js";

export interface CreateGoogleUserData {
  googleId: string;
  email: string;
  name: string;
}

export class UserRepository {
  async findByGoogleId(googleId: string) {
    const result = await pool.query(
      `
      SELECT
        user_id,
        google_id,
        email,
        name,
        created_at
      FROM users
      WHERE google_id = $1
      LIMIT 1
      `,
      [googleId],
    );

    return result.rows[0] ?? null;
  }

  async createGoogleUser(data: CreateGoogleUserData) {
    const result = await pool.query(
      `
      INSERT INTO users (
        google_id,
        email,
        name
      )
      VALUES ($1, $2, $3)
      RETURNING
        user_id,
        google_id,
        email,
        name,
        created_at
      `,
      [data.googleId, data.email, data.name],
    );

    return result.rows[0];
  }
}
