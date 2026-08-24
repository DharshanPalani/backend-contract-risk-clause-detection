import type { Request, Response } from "express";
import multer from "multer";
import { ExtractorService } from "../services/extractor.js";
import { LLMService } from "../services/llm.js";

export class MainController {
  public upload = multer({
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

  private extractorService = new ExtractorService();
  private llmService = new LLMService();

  async review(request: Request, response: Response) {
    const file = request.file;

    if (!file) {
      return response.status(400).json({
        error: "PDF file is required",
      });
    }

    const extracted = await this.extractorService.extractPDF(file.buffer);

    const contractText = extracted.pages
      .map((page) => `--- Page ${page.pageNumber} ---\n${page.content}`)
      .join("\n\n");

    // console.log(contractText);

    // return response.status(201).send("DONE!");

    const result = await this.llmService.callLLM(contractText);

    return response.json(result);

    return response.status(201).send("work");
  }
}
