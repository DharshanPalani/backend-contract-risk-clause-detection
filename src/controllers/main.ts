import type { Request, Response } from "express";
import multer from "multer";

import { ExtractorService } from "../services/extractor.js";
import { LLMService } from "../services/llm.js";
import { MainService } from "../services/main.js";
import { template_data } from "../template_data.js";

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

  // ==========================================
  // POST /api/reports/compare
  // ==========================================

  async compareReports(request: Request, response: Response) {
    try {
      const userId = (request.user as any).userId;

      const { reportId1, reportId2 } = request.body;

      const id1 = Number(reportId1);
      const id2 = Number(reportId2);

      if (!Number.isInteger(id1) || !Number.isInteger(id2)) {
        return response.status(400).json({
          status: "error",
          message: "Both report IDs must be valid integers",
        });
      }

      if (id1 === id2) {
        return response.status(400).json({
          status: "error",
          message: "Cannot compare a report with itself",
        });
      }

      const comparison = await this.mainService.compareReports(
        id1,
        id2,
        userId,
      );

      if (!comparison) {
        return response.status(404).json({
          status: "error",
          message: "One or both reports were not found",
        });
      }

      return response.status(200).json({
        status: "good",
        comparison,
      });
    } catch (error) {
      console.error("Compare reports error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to compare reports",
      });
    }
  }

  // ==========================================
  // POST /api/review
  // ==========================================

  async review(request: Request, response: Response) {
    const file = request.file;

    if (!file) {
      return response.status(400).json({
        status: "error",
        message: "PDF file is required",
      });
    }

    try {
      const userId = (request.user as any).userId;

      // ------------------------------------------
      // Extract PDF text page-by-page
      // ------------------------------------------

      const extracted = await this.extractorService.extractPDF(file.buffer);

      const contractText = extracted.pages
        .map((page) => `--- Page ${page.pageNumber} ---\n${page.content}`)
        .join("\n\n");

      // ------------------------------------------
      // Send extracted text to LLM
      // ------------------------------------------

      const USE_LLM = process.env.DEV_MODE;

      let result: any;

      if (USE_LLM === "false") {
        result = template_data;
      } else {
        const llmResult = await this.llmService.callLLM(contractText);

        result =
          typeof llmResult === "string" ? JSON.parse(llmResult) : llmResult;
      }

      console.log("PARSED RESULT:", result);

      // ------------------------------------------
      // Store report + raw extraction separately
      // ------------------------------------------

      const report = await this.mainService.createReport({
        userId,

        title: result.title,

        startDate: result.startDate ?? null,

        endDate: result.endDate ?? null,

        // LLM analysis only
        reportContent: result.report,

        // Raw PDF extraction
        extractedData: {
          total_pages: extracted.totalPages,

          pages: extracted.pages.map((page) => ({
            pageNumber: page.pageNumber,
            content: page.content,
          })),
        },
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

  // ==========================================
  // GET /api/reports
  // ==========================================

  async getReports(request: Request, response: Response) {
    try {
      const userId = (request.user as any).userId;

      const reports = await this.mainService.getReports(userId);

      return response.status(200).json({
        status: "good",
        reports,
      });
    } catch (error) {
      console.error("Get reports error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to get reports",
      });
    }
  }

  // ==========================================
  // POST /api/reports/:reportId/highlights
  // ==========================================

  async generateHighlights(request: Request, response: Response) {
    try {
      const userId = (request.user as any).userId;

      const reportId = Number(request.params.reportId);

      if (!Number.isInteger(reportId)) {
        return response.status(400).json({
          status: "error",
          message: "Invalid report ID",
        });
      }

      const highlights = await this.mainService.generateReportHighlights(
        reportId,
        userId,
      );

      if (!highlights) {
        return response.status(404).json({
          status: "error",
          message: "Report not found",
        });
      }

      return response.status(200).json({
        status: "good",
        ...highlights,
      });
    } catch (error) {
      console.error("Generate highlights error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to generate highlights",
      });
    }
  }

  // ==========================================
  // GET /api/reports/:reportId
  // ==========================================

  async getReport(request: Request, response: Response) {
    try {
      const userId = (request.user as any).userId;

      const reportId = Number(request.params.reportId);

      if (!Number.isInteger(reportId)) {
        return response.status(400).json({
          status: "error",
          message: "Invalid report ID",
        });
      }

      const report = await this.mainService.getReport(reportId, userId);

      if (!report) {
        return response.status(404).json({
          status: "error",
          message: "Report not found",
        });
      }

      return response.status(200).json({
        status: "good",
        report,
      });
    } catch (error) {
      console.error("Get report error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to get report",
      });
    }
  }

  // ==========================================
  // PATCH /api/reports/:reportId/close
  // ==========================================

  async closeReport(request: Request, response: Response) {
    try {
      const userId = (request.user as any).userId;

      const reportId = Number(request.params.reportId);

      if (!Number.isInteger(reportId)) {
        return response.status(400).json({
          status: "error",
          message: "Invalid report ID",
        });
      }

      const report = await this.mainService.closeReport(reportId, userId);

      if (!report) {
        return response.status(404).json({
          status: "error",
          message: "Active report not found",
        });
      }

      return response.status(200).json({
        status: "good",
        report,
      });
    } catch (error) {
      console.error("Close report error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to close report",
      });
    }
  }

  // ==========================================
  // PATCH /api/reports/:reportId/restore
  // ==========================================

  async restoreReport(request: Request, response: Response) {
    try {
      const userId = (request.user as any).userId;

      const reportId = Number(request.params.reportId);

      if (!Number.isInteger(reportId)) {
        return response.status(400).json({
          status: "error",
          message: "Invalid report ID",
        });
      }

      const report = await this.mainService.restoreReport(reportId, userId);

      if (!report) {
        return response.status(404).json({
          status: "error",
          message: "Closed report not found",
        });
      }

      return response.status(200).json({
        status: "good",
        report,
      });
    } catch (error) {
      console.error("Restore report error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to restore report",
      });
    }
  }

  // ==========================================
  // DELETE /api/reports/:reportId
  // ==========================================

  async deleteReport(request: Request, response: Response) {
    try {
      const userId = (request.user as any).userId;

      const reportId = Number(request.params.reportId);

      if (!Number.isInteger(reportId)) {
        return response.status(400).json({
          status: "error",
          message: "Invalid report ID",
        });
      }

      const report = await this.mainService.deleteReport(reportId, userId);

      if (!report) {
        return response.status(404).json({
          status: "error",
          message: "Report not found",
        });
      }

      return response.status(200).json({
        status: "good",
        message: "Report deleted",
        report,
      });
    } catch (error) {
      console.error("Delete report error:", error);

      return response.status(500).json({
        status: "error",
        message: "Failed to delete report",
      });
    }
  }
}
