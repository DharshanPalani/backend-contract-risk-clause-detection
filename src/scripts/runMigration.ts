import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import pool from "../config/db.js";

dotenv.config();

async function runMigrations() {
  try {
    console.log("Init Migration!");

    await pool.query(`CREATE TABLE IF NOT EXISTS migrations(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW(),

      CONSTRAINT unique_migration_name
        UNIQUE(name)
      )`);

    const migrationsDir = path.join(process.cwd(), "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const result = await pool.query(
        `SELECT 1 FROM migrations WHERE name = $1`,
        [file],
      );

      if ((result.rowCount ?? 0) > 0) {
        console.log(`Skipping ${file} (already executed)`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`Running migration: ${file}`);

      await pool.query("BEGIN");

      try {
        await pool.query(sql);
        await pool.query("INSERT INTO migrations(name) VALUES($1)", [file]);

        await pool.query("COMMIT");
      } catch (err) {
        await pool.query("ROLLBACK");
        throw err;
      }
    }

    console.log("All migrations executed successfully!");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

runMigrations();
