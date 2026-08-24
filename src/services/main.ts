import { MainRepository } from "../repositories/main.js";

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

  async createReport(data: CreateReportData) {
    return this.mainRepository.createReport(data);
  }

  async getReports(userId: number) {
    return this.mainRepository.getReportsByUser(userId);
  }

  async getReport(reportId: number, userId: number) {
    return this.mainRepository.getReportById(reportId, userId);
  }

  async closeReport(reportId: number, userId: number) {
    return this.mainRepository.closeReport(reportId, userId);
  }

  async restoreReport(reportId: number, userId: number) {
    return this.mainRepository.restoreReport(reportId, userId);
  }

  async deleteReport(reportId: number, userId: number) {
    return this.mainRepository.deleteReport(reportId, userId);
  }
}
