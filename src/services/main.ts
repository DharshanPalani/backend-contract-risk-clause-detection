import { MainRepository } from "../repositories/main.js";

interface CreateReportData {
  userId: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  reportContent: object;
}

export class MainService {
  private mainRepository = new MainRepository();

  async createReport(data: CreateReportData) {
    return this.mainRepository.createReport(data);
  }
}
