import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

import mainRouter from "./routes/main.js";
import authRouter from "./routes/auth.js";
import "./auth/passportSetup.js";

const app = express();

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

// --------------------------------------------------
// Routes
// --------------------------------------------------

// app.use("/api", mainRouter);
app.use("/auth", authRouter);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/", (_request: Request, response: Response) => {
  response.status(200).json({
    status: "good",
    message: "Backend is running",
  });
});

export default app;
