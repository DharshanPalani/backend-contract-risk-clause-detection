import { Pool } from "pg";
import dotenv from "dotenv";
import { env } from "./env";

dotenv.config();

const pool = new Pool({
  connectionString: env.DB_CONNECTION_STRING,
});

export default pool;
