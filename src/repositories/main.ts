import pool from "../config/db.js";

export interface CreateReportData {
  userId: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  reportContent: unknown;

  extractedData: {
    total_pages: number;
    pages: {
      pageNumber: number;
      content: string;
    }[];
  };
}

export class MainRepository {
  // ==========================================
  // CREATE REPORT
  // ==========================================

  async createReport(data: CreateReportData) {
    const result = await pool.query(
      `
      INSERT INTO contract_reports (
        user_id,
        title,
        start_date,
        end_date,
        report_content,
        extracted_data
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        data.userId,
        data.title,
        data.startDate,
        data.endDate,
        JSON.stringify(data.reportContent),
        JSON.stringify(data.extractedData),
      ],
    );

    return result.rows[0];
  }

  async getReportsForComparison(
    reportId1: number,
    reportId2: number,
    userId: number,
  ) {
    const result = await pool.query(
      `
    SELECT
      report_id,
      title,
      report_content,
      status,
      created_at
    FROM contract_reports
    WHERE report_id = ANY($1)
      AND user_id = $2
      AND status != 'deleted'
    ORDER BY report_id ASC
    `,
      [[reportId1, reportId2], userId],
    );

    return result.rows;
  }

  // ==========================================
  // GET ALL REPORTS
  // ==========================================

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
      extracted_data,
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

  // ==========================================
  // GET SINGLE REPORT
  // ==========================================

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
      extracted_data,
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

  // ==========================================
  // CLOSE REPORT
  // ==========================================

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
        extracted_data,
        status,
        created_at
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }

  // ==========================================
  // RESTORE REPORT
  // ==========================================

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
        extracted_data,
        status,
        created_at
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }

  // ==========================================
  // DELETE REPORT
  // ==========================================

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
        report_content,
        extracted_data,
        status,
        created_at
      `,
      [reportId, userId],
    );

    return result.rows[0] ?? null;
  }
}
