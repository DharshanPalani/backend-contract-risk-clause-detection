import type { Request, Response } from "express";
import multer from "multer";
import { ExtractorService } from "../services/extractor.js";
import { LLMService } from "../services/llm.js";
import { template_data } from "../template_data.js";
import { MainService } from "../services/main.js";

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
  private mainService = new MainService();

  async review(request: Request, response: Response) {
    const file = request.file;

    if (!file) {
      return response.status(400).json({
        status: "error",
        message: "PDF file is required",
      });
    }

    try {
      const extracted = await this.extractorService.extractPDF(file.buffer);

      const contractText = extracted.pages
        .map((page) => `--- Page ${page.pageNumber} ---\n${page.content}`)
        .join("\n\n");

      const USE_LLM = process.env.DEV_MODE;

      let result: any;

      if (USE_LLM === "false") {
        result = template_data;
      } else {
        const llmResult = await this.llmService.callLLM(contractText);

        // LLM returns JSON as a string
        result =
          typeof llmResult === "string" ? JSON.parse(llmResult) : llmResult;
      }

      console.log("PARSED RESULT:", result);

      // Hardcoded user ID for now
      const userId = 1;

      const report = await this.mainService.createReport({
        userId,
        title: result.title,
        startDate: result.startDate,
        endDate: result.endDate,
        reportContent: result.report,
      });

      return response.status(201).json({
        status: "good",
        report,
      });
    } catch (error) {
      console.error("Contract review error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to process contract",
      });
    }
  }
}
