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

  async findReportsByUserId(userId: number) {
    const result = await pool.query(
      `
      SELECT
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        created_at
      FROM contract_reports
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId],
    );

    return result.rows;
  }

  async findReportById(reportId: number, userId: number) {
    const result = await pool.query(
      `
      SELECT
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        report_content,
        created_at
      FROM contract_reports
      WHERE report_id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }
}
