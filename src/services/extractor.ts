import { PDFParse } from "pdf-parse";

export interface ExtractedPage {
  pageNumber: number;
  content: string;
}

export interface ExtractedPDF {
  pages: ExtractedPage[];
  totalPages: number;
}

export class ExtractorService {
  async extractPDF(buffer: Buffer): Promise<ExtractedPDF> {
    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();

      const pages = result.pages.map((page, index) => ({
        pageNumber: index + 1,
        content: page.text,
      }));

      return {
        pages,
        totalPages: pages.length,
      };
    } finally {
      await parser.destroy();
    }
  }
}
