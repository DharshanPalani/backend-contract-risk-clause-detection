import { MainRepository } from "../repositories/main.js";

export class MainService {
  private mainRepository = new MainRepository();

  async createReport(data: {
    userId: number;
    title: string;
    startDate: string | null;
    endDate: string | null;
    reportContent: object;
  }) {
    return this.mainRepository.createReport(data);
  }

  async getUserReports(userId: number) {
    return this.mainRepository.findReportsByUserId(userId);
  }

  async getReport(reportId: number, userId: number) {
    return this.mainRepository.findReportById(reportId, userId);
  }
}
