import pool from "../config/db.js";

export interface CreateReportData {
  userId: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  reportContent: object;
}

export class MainRepository {
  async createReport(data: CreateReportData) {
    const result = await pool.query(
      `
      INSERT INTO contract_reports (
        user_id,
        title,
        start_date,
        end_date,
        report_content
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        report_content,
        created_at
      `,
      [
        data.userId,
        data.title,
        data.startDate,
        data.endDate,
        JSON.stringify(data.reportContent),
      ],
    );

    return result.rows[0];
  }
}
