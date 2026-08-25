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
You are a contract comparison assistant.

Compare the two supplied document analyses and determine which document is
more favorable overall.

Do not assume that one type of document is better than another.

Base your comparison ONLY on the supplied analysis.

Consider the actual information available in both documents and compare
their terms, obligations, financial conditions, protections, restrictions,
responsibilities, and other relevant differences.

Do not invent provisions that are not present.

==================================================
DOCUMENT 1
==================================================

Report ID:
${document1.reportId}

Title:
${document1.title}

Analysis:
${JSON.stringify(document1.analysis, null, 2)}

==================================================
DOCUMENT 2
==================================================

Report ID:
${document2.reportId}

Title:
${document2.title}

Analysis:
${JSON.stringify(document2.analysis, null, 2)}

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "better_document": "document_1" | "document_2" | "tie",

  "document_1_score": number,

  "document_2_score": number,

  "summary": "Natural explanation of which document is better and why.",

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
      "category": "category",
      "document_1": "Information from document 1",
      "document_2": "Information from document 2",
      "better": "document_1" | "document_2" | "tie",
      "explanation": "Explanation of the difference."
    }
  ]
}

Scoring:

90-100 = Very favorable
75-89 = Favorable
60-74 = Acceptable
40-59 = Weak
0-39 = Highly unfavorable

The score represents overall contractual favorability.

Return JSON only.
`;

    return this.requestLLM(prompt);
  }

  // ==========================================
  // ANSWER QUESTION ABOUT REPORT
  // ==========================================

  async answerReportQuestion(
    question: string,
    report: {
      title: string;
      analysis: any;
    },
  ) {
    const prompt = `
You are a helpful assistant that answers questions about a document.

Your ONLY job in this request is to answer the user's question using the
document analysis supplied below.

The document can be any kind of document, including:

- Freelance agreement
- Employment agreement
- Vendor agreement
- Service agreement
- Housing agreement
- Tender
- Purchase agreement
- Business agreement
- NDA
- Contractor agreement
- Or any other document

Do not assume the document type.

Do not perform a general contract review.

Do not generate an overall risk assessment unless the user specifically
asks for one.

Do not give the user a generic contract summary.

Do not automatically discuss specific legal topics.

Instead, answer EXACTLY what the user asks.

==================================================
DOCUMENT
==================================================

Title:
${report.title}

Analysis JSON:
${JSON.stringify(report.analysis, null, 2)}

==================================================
USER QUESTION
==================================================

${question}

==================================================
HOW TO ANSWER
==================================================

Search the ENTIRE supplied analysis for information relevant to the question.

The user can ask absolutely any question.

For example:

"How much am I getting paid?"

Find the payment or compensation information and give the amount.

"How long is the project?"

Find the project duration or relevant start/end dates and answer directly.

"When will I get paid?"

Find the payment schedule and explain it.

"Who is the client?"

Find the relevant party information.

"What am I supposed to deliver?"

Find the relevant deliverables.

"What is my role?"

Find the relevant role or responsibilities.

"What does this clause mean?"

Find the relevant clause or analysis and explain it.

"What happens if I don't complete the work?"

Find the relevant information and explain it.

"Is there anything about X?"

Search the analysis for X and explain what is available.

These are ONLY examples.

Do not restrict yourself to these examples or to any predefined categories.

If the user asks something simple, give a simple direct answer.

If the user asks something that requires explanation, provide the necessary
explanation.

If answering requires combining multiple pieces of information from the
analysis, combine them logically.

==================================================
IMPORTANT
==================================================

Answer the question FIRST.

Do not start with:

"Based on your Service Agreement..."

Do not start with:

"Your contract has a risk score of..."

Do not start with:

"Here is an overview of your contract..."

Do not provide unrelated information.

Do not repeat the entire analysis.

Do not mention categories that are unrelated to the question.

Do not automatically mention risk.

Do not automatically mention termination.

Do not automatically mention intellectual property.

Do not automatically mention negotiation.

Do not automatically mention legal advice.

Only discuss those things if they are relevant to the user's question.

==================================================
GROUNDING
==================================================

ONLY use information present in the supplied analysis JSON.

Never invent:

- Payment amounts
- Dates
- Duration
- Parties
- Responsibilities
- Clauses
- Penalties
- Rights
- Obligations
- Facts
- Legal provisions

If the information exists in the analysis, use it.

If the information does NOT exist in the analysis, clearly say that it could
not be found.

Do not guess.

If the analysis contains conflicting information, explain the conflict.

If the information is ambiguous, say that it is ambiguous instead of
pretending that the answer is certain.

==================================================
CONVERSATIONAL STYLE
==================================================

Be natural and conversational.

Speak directly to the user.

Do not sound like a legal report.

Do not repeat the question unnecessarily.

Do not use unnecessary headings.

Do not use unnecessary bullet points for a simple factual question.

For example, if the user asks:

"How much am I getting paid?"

A good answer would be:

"You'll be paid ₹50,000 for the project."

If the analysis says payment is split into stages, then explain the stages.

If the user asks:

"How long is the project?"

A good answer would be:

"The project runs for 3 months, from June 1 to August 31."

If the information isn't available:

"I couldn't find the project duration in the available document analysis."

==================================================
CONFIDENCE
==================================================

Set confidence based on how clearly the analysis supports the answer.

"high":
The answer is explicitly stated or can be directly determined.

"medium":
The answer is reasonably supported but has some ambiguity.

"low":
The analysis provides insufficient or unclear information.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "answer": "The complete natural-language answer to the user's question.",
  "confidence": "high" | "medium" | "low"
}

Return JSON only.
`;

    console.log("==========================================");
    console.log("REPORT QUESTION");
    console.log("==========================================");
    console.log("Question:", question);
    console.log("Report:", report.title);

    // IMPORTANT:
    // Use requestLLM directly.
    // DO NOT use callLLM here.
    const result = await this.requestLLM(prompt);

    console.log("Question answer:", result);

    return typeof result === "string" ? JSON.parse(result) : result;
  }
}
