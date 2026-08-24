import pool from "../config/db";

export interface CreateReportData {
  userId: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  reportContent: unknown;
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
        status,
        created_at
      `,
      [
        data.userId,
        data.title,
        data.startDate,
        data.endDate,
        data.reportContent,
      ],
    );

    return result.rows[0];
  }

  async getReportsByUser(userId: number) {
    const result = await pool.query(
      `
      SELECT
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        report_content,
        status,
        created_at
      FROM contract_reports
      WHERE user_id = $1
        AND status != 'deleted'
      ORDER BY created_at DESC
      `,
      [userId],
    );

    return result.rows;
  }

  async getReportById(reportId: number, userId: number) {
    const result = await pool.query(
      `
      SELECT
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        report_content,
        status,
        created_at
      FROM contract_reports
      WHERE report_id = $1
        AND user_id = $2
        AND status != 'deleted'
      LIMIT 1
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }

  async closeReport(reportId: number, userId: number) {
    const result = await pool.query(
      `
      UPDATE contract_reports
      SET status = 'closed'
      WHERE report_id = $1
        AND user_id = $2
        AND status = 'active'
      RETURNING
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        report_content,
        status,
        created_at
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }

  async restoreReport(reportId: number, userId: number) {
    const result = await pool.query(
      `
      UPDATE contract_reports
      SET status = 'active'
      WHERE report_id = $1
        AND user_id = $2
        AND status = 'closed'
      RETURNING
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        report_content,
        status,
        created_at
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }

  async deleteReport(reportId: number, userId: number) {
    const result = await pool.query(
      `
      UPDATE contract_reports
      SET status = 'deleted'
      WHERE report_id = $1
        AND user_id = $2
        AND status != 'deleted'
      RETURNING
        report_id,
        user_id,
        title,
        start_date,
        end_date,
        status,
        created_at
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }
}
