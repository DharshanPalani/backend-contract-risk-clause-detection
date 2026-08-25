import { LLM_prompt } from "../prompt.js";
import { HIGHLIGHT_PROMPT } from "../highlight_prompt.js";
import type { HighlightResponse } from "../types/highlight.js";

export class LLMService {
  // ==========================================
  // GENERIC LLM REQUEST
  // ==========================================

  private async requestLLM(prompt: string) {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },

      body: JSON.stringify({
        model: "deepseek-v4-flash",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        response_format: {
          type: "json_object",
        },

        thinking: {
          type: "disabled",
        },

        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `DeepSeek API error: ${response.status} ${await response.text()}`,
      );
    }

    const result: any = await response.json();

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("DeepSeek returned empty content");
    }

    try {
      return JSON.parse(content);
    } catch {
      console.error("Failed to parse DeepSeek JSON:");
      console.error(content);

      throw new Error("DeepSeek returned invalid JSON");
    }
  }

  // ==========================================
  // NORMAL CONTRACT ANALYSIS
  // ==========================================

  async callLLM(data: string) {
    const prompt = `
${LLM_prompt}

==================================================
RAW CONTRACT
==================================================

${data}
`;

    return this.requestLLM(prompt);
  }

  // ==========================================
  // GENERATE HIGHLIGHTS
  // ==========================================

  async generateHighlights(
    pages: {
      pageNumber: number;
      content: string;
    }[],
  ): Promise<HighlightResponse> {
    const pageText = pages
      .map((page) => `--- Page ${page.pageNumber} ---\n${page.content}`)
      .join("\n\n");

    const prompt = `
${HIGHLIGHT_PROMPT}

==================================================
EXTRACTED CONTRACT TEXT
==================================================

${pageText}
`;

    const result = await this.requestLLM(prompt);

    return result as HighlightResponse;
  }

  // ==========================================
  // COMPARE TWO REPORTS
  // ==========================================

  async compareReports(
    document1: {
      reportId: number;
      title: string;
      analysis: any;
    },

    document2: {
      reportId: number;
      title: string;
      analysis: any;
    },
  ) {
    const prompt = `
You are a contract comparison expert.

Compare the following two contract analysis reports.

Your job is to determine which document is more favorable overall.

Do NOT simply choose the document with the lower risk score.

Consider the actual contractual provisions and analysis, including:

- Liability
- Termination
- Payment
- Intellectual property
- Confidentiality
- Dispute resolution
- Notice periods
- Obligations
- Penalties
- Restrictions
- Indemnification
- Compensation
- Renewal
- Other important contractual terms

Do not invent provisions that are not present in the supplied analysis.

==================================================
DOCUMENT 1
==================================================

Report ID:
${document1.reportId}

Title:
${document1.title}

Analysis JSON:
${JSON.stringify(document1.analysis, null, 2)}

==================================================
DOCUMENT 2
==================================================

Report ID:
${document2.reportId}

Title:
${document2.title}

Analysis JSON:
${JSON.stringify(document2.analysis, null, 2)}

==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "better_document": "document_1" | "document_2" | "tie",

  "document_1_score": number,

  "document_2_score": number,

  "summary": "Natural language explanation of which document is better overall and why.",

  "document_1": {
    "strengths": [
      "strength"
    ],
    "weaknesses": [
      "weakness"
    ]
  },

  "document_2": {
    "strengths": [
      "strength"
    ],
    "weaknesses": [
      "weakness"
    ]
  },

  "key_differences": [
    {
      "category": "category name",

      "document_1": "What document 1 says",

      "document_2": "What document 2 says",

      "better": "document_1" | "document_2" | "tie",

      "explanation": "Why one document is better in this category."
    }
  ]
}

==================================================
SCORING
==================================================

90-100 = Very favorable

75-89 = Favorable

60-74 = Acceptable

40-59 = Weak

0-39 = Highly unfavorable

The score represents overall contractual favorability.

It is NOT a raw risk percentage.

A higher score means the contract is generally more favorable
to the party being evaluated.

Be objective.

Do not invent contractual provisions.

Base the comparison only on the supplied analysis JSON.

Return JSON only.
`;

    const result = await this.requestLLM(prompt);

    return result;
  }

  async answerReportQuestion(
    question: string,
    report: {
      title: string;
      analysis: any;
    },
  ) {
    const prompt = `
You are a contract analysis assistant.

Answer the user's question using ONLY the supplied contract analysis.

Do not invent clauses, facts, dates, obligations, or risks that are not present
in the supplied analysis.

If the answer cannot be determined from the analysis, clearly say that the
available contract analysis does not contain enough information.

Give a clear, natural-language answer suitable for a user who wants to
understand their contract.

Contract title:
${report.title}

Contract analysis:
${JSON.stringify(report.analysis, null, 2)}

User question:
${question}

Return ONLY valid JSON using this exact structure:

{
  "answer": "Clear natural-language answer to the user's question.",
  "confidence": "high" | "medium" | "low",
  "relevant_categories": [
    "category name"
  ]
}

Rules:

- Answer the actual question directly.
- Do not repeat the entire contract analysis.
- Do not invent information.
- If the question asks whether something is allowed, explain what the
  contract analysis says about it.
- If there is ambiguity, explicitly mention it.
- Keep the answer concise but useful.
- Return JSON only.
`;

    const result = await this.callLLM(prompt);

    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    return parsed;
  }
}
