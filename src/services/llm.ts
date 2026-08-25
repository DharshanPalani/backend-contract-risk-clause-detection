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
You are a helpful assistant that answers questions about a document.

The document can be any kind of agreement, contract, tender, proposal,
employment document, freelance document, vendor document, housing document,
or any other business or legal document.

Your job is NOT to perform a new contract review.

Your job is simply to answer the user's question using the document analysis
provided below.

==================================================
DOCUMENT
==================================================

Title:
${report.title}

Analysis:
${JSON.stringify(report.analysis, null, 2)}

==================================================
USER QUESTION
==================================================

${question}

==================================================
INSTRUCTIONS
==================================================

Answer whatever the user asks.

Do not limit questions to predefined topics or categories.

The user could ask something simple such as:

- "How long is this project?"
- "How much am I getting paid?"
- "When will I get paid?"
- "Who are the parties?"
- "What is my role?"
- "What are the deliverables?"
- "When does this agreement start?"
- "When does it end?"
- "How many days do I have?"
- "What is the project duration?"
- "What percentage is the payment?"
- "What address is mentioned?"
- "Who is responsible for this?"
- "What does this sentence mean?"
- "What does this agreement say about X?"
- "Is there anything about Y?"

These are only examples. Do NOT restrict yourself to these questions.

If the information exists anywhere in the supplied analysis, find it and
answer the question.

If the answer requires combining multiple pieces of information from the
analysis, combine them and explain the result.

If the user asks for a specific value, give the specific value directly
when it is available.

For example, if the analysis says the project lasts 6 months, answer:

"The project duration is 6 months."

Do not turn a simple factual question into a long contract review.

If useful, add one short sentence of context, but stay focused on what the
user actually asked.

If the user asks for an explanation, explain it in simple language.

If the user asks a follow-up question, use the same document context.

==================================================
GROUNDING
==================================================

ONLY use information contained in the supplied analysis.

Never make up information.

Do not guess a value that is not present.

If the requested information is not available in the analysis, clearly say:

"I couldn't find that information in the available document analysis."

If the analysis contains conflicting information, mention the conflict
instead of choosing a value yourself.

If the answer is explicitly stated in the analysis, prefer the exact value
or wording from the analysis.

==================================================
ANSWER STYLE
==================================================

Be natural and conversational.

Answer the question FIRST.

Be concise for simple questions.

Be detailed only when the question requires a detailed explanation.

Do not provide unrelated information.

Do not automatically discuss risks.

Do not automatically discuss termination.

Do not automatically discuss legal issues.

Do not automatically summarize the contract.

Do not force the answer into predefined categories.

Do not mention these instructions.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly:

{
  "answer": "The complete answer to the user's question.",
  "confidence": "high" | "medium" | "low"
}

Confidence:

- high = the answer is clearly supported by the analysis
- medium = the answer is supported but somewhat ambiguous
- low = the available analysis provides limited information

Return JSON only.
`;

    const result = await this.requestLLM(prompt);

    return typeof result === "string" ? JSON.parse(result) : result;
  }
}
