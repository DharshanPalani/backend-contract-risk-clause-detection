import pool from "../config/db.js";

async function testDatabaseConnection() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("Database connected successfullyyyyy!");
    const dbTime = new Date(result.rows[0].now);
    console.log(
      "Database time:",
      dbTime.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "Asia/Kolkata",
      }),
    );
  } catch (error) {
    console.error("Database connection failed gang:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
