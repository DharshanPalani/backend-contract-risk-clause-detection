import { MainRepository } from "../repositories/main.js";
import { LLMService } from "./llm.js";

export interface CreateReportData {
  userId: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  reportContent: any;

  extractedData: {
    total_pages: number;
    pages: {
      pageNumber: number;
      content: string;
    }[];
  };
}

export class MainService {
  private mainRepository = new MainRepository();
  private llmService = new LLMService();

  // ==========================================
  // GENERATE REPORT HIGHLIGHTS
  // ==========================================

  async generateReportHighlights(reportId: number, userId: number) {
    const report = await this.mainRepository.getReportById(reportId, userId);

    if (!report) {
      return null;
    }

    if (!report.extracted_data) {
      throw new Error("No extracted data available for this report");
    }

    const extractedData =
      typeof report.extracted_data === "string"
        ? JSON.parse(report.extracted_data)
        : report.extracted_data;

    if (!Array.isArray(extractedData.pages)) {
      throw new Error("Invalid extracted data format");
    }

    const highlights = await this.llmService.generateHighlights(
      extractedData.pages,
    );

    return highlights;
  }

  // ==========================================
  // CREATE REPORT
  // ==========================================

  async createReport(data: CreateReportData) {
    return this.mainRepository.createReport(data);
  }

  // ==========================================
  // GET REPORTS
  // ==========================================

  async getReports(userId: number) {
    return this.mainRepository.getReportsByUser(userId);
  }

  // ==========================================
  // GET SINGLE REPORT
  // ==========================================

  async getReport(reportId: number, userId: number) {
    return this.mainRepository.getReportById(reportId, userId);
  }

  // ==========================================
  // CLOSE REPORT
  // ==========================================

  async closeReport(reportId: number, userId: number) {
    return this.mainRepository.closeReport(reportId, userId);
  }

  // ==========================================
  // RESTORE REPORT
  // ==========================================

  async restoreReport(reportId: number, userId: number) {
    return this.mainRepository.restoreReport(reportId, userId);
  }

  // ==========================================
  // DELETE REPORT
  // ==========================================

  async deleteReport(reportId: number, userId: number) {
    return this.mainRepository.deleteReport(reportId, userId);
  }
}
