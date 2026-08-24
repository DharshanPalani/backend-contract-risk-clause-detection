import express from "express";
import multer from "multer";

import dotenv from "dotenv";

import type { Request, Response } from "express";

import mainRouter from "./routes/main.js";

dotenv.config();

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

app.use("/api", mainRouter);

app.get("/", (_request: Request, response: Response) => {
  response.send("Hello son!! 67");
});

export default app;
