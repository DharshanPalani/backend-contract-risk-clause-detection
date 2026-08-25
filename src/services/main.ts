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
  // COMPARE TWO REPORTS
  // ==========================================

  async compareReports(reportId1: number, reportId2: number, userId: number) {
    if (reportId1 === reportId2) {
      throw new Error("Cannot compare a report with itself");
    }

    const reports = await this.mainRepository.getReportsForComparison(
      reportId1,
      reportId2,
      userId,
    );

    // One or both reports don't exist / don't belong
    // to the authenticated user.
    if (reports.length !== 2) {
      return null;
    }

    const report1 = reports.find(
      (report) => Number(report.report_id) === reportId1,
    );

    const report2 = reports.find(
      (report) => Number(report.report_id) === reportId2,
    );

    if (!report1 || !report2) {
      return null;
    }

    const reportContent1 =
      typeof report1.report_content === "string"
        ? JSON.parse(report1.report_content)
        : report1.report_content;

    const reportContent2 =
      typeof report2.report_content === "string"
        ? JSON.parse(report2.report_content)
        : report2.report_content;

    const comparison = await this.llmService.compareReports(
      {
        reportId: Number(report1.report_id),

        title: report1.title,

        analysis: reportContent1,
      },

      {
        reportId: Number(report2.report_id),

        title: report2.title,

        analysis: reportContent2,
      },
    );

    return {
      document1: {
        reportId: Number(report1.report_id),
        title: report1.title,
      },

      document2: {
        reportId: Number(report2.report_id),
        title: report2.title,
      },

      comparison,
    };
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
