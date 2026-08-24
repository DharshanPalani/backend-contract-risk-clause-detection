import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import type { Request, Response } from "express";
import mainRouter from "./routes/main.js";
import authRouter from "./routes/auth.js";

import passport from "passport";

dotenv.config();

const app = express();

app.use(passport.initialize());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use("/api", mainRouter);

app.use("/auth", authRouter);

app.get("/", (_request: Request, response: Response) => {
  response.send("Hello son!! 67");
});

export default app;
