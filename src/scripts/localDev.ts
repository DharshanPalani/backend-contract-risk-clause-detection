import app from "../index.js";

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit(0);
});
