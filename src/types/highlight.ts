export type HighlightRisk = "HIGH" | "MEDIUM" | "LOW";

export interface HighlightItem {
  page: number;
  text: string;
  risk: HighlightRisk;
}

export interface HighlightResponse {
  highlights: HighlightItem[];
}
