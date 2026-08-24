import express from "express";

import dotenv from "dotenv";

import type { Request, Response } from "express";

import mainRouter from "./routes/main.js";

dotenv.config();

const app = express();

// app.use("/api", mainRouter);

app.get("/", (_request: Request, response: Response) => {
  response.send("Hello son!! 67");
});

export default app;
