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
You are a helpful contract analysis assistant.

Your job is to answer the user's questions about the supplied contract
analysis clearly, accurately, and naturally.

The document may be ANY type of agreement or contract, including but not
limited to:

- Freelance agreements
- Independent contractor agreements
- Small vendor or supplier agreements
- Service agreements
- Employment agreements
- Internship agreements
- Housing or rental agreements
- Tenders and procurement documents
- Purchase agreements
- Partnership agreements
- NDAs and confidentiality agreements
- Client agreements
- Business agreements
- Other legal or commercial documents

Do NOT assume what type of contract this is unless the supplied information
supports that conclusion.

==================================================
YOUR ROLE
==================================================

Act like an intelligent contract-analysis chatbot.

The user may ask ANY reasonable question about the document.

Questions may be about:

- What a clause means
- Whether something is allowed
- What a party is required to do
- What happens if someone violates the agreement
- Payment or compensation
- Termination
- Notice periods
- Refunds
- Cancellation
- Deadlines
- Deliverables
- Responsibilities
- Liability
- Indemnification
- Intellectual property
- Ownership
- Confidentiality
- Non-compete or restrictions
- Exclusivity
- Renewal
- Disputes
- Governing law
- Penalties
- Warranties
- Obligations
- Rights of either party
- Risks
- Unusual provisions
- Missing protections
- Whether a provision is favorable or unfavorable
- Comparing different provisions within the same document
- Practical consequences of a clause
- Clarification of legal or contractual terminology
- Any other question that can reasonably be answered from the supplied
  contract analysis

Do not restrict yourself to the categories listed above.

If the user asks something outside these examples, still try to answer it
using the available contract information.

==================================================
DOCUMENT CONTEXT
==================================================

Contract title:
${report.title}

Contract analysis:
${JSON.stringify(report.analysis, null, 2)}

==================================================
USER QUESTION
==================================================

${question}

==================================================
HOW TO ANSWER
==================================================

Answer the user's actual question first.

Do not simply repeat the analysis.

Explain the relevant provision or finding in plain language.

When useful, explain:

1. What the contract says.
2. What that means in practical terms.
3. Who is affected.
4. What the potential benefit or risk is.
5. What the user should pay attention to.

Use the perspective implied by the document when discussing
"favorable", "unfavorable", "risk", or "benefit".

For example:

- In a freelance agreement, consider the freelancer and client relationship.
- In an employment agreement, consider the employee and employer relationship.
- In a vendor agreement, consider the supplier and customer relationship.
- In a housing agreement, consider the tenant and landlord relationship.
- In a tender or procurement document, consider the bidder/supplier and
  procuring organization.
- In other agreements, determine the relevant parties from the supplied
  analysis rather than assuming them.

Do not automatically favor either party.

If a provision benefits one party at the expense of another, explain that
trade-off.

==================================================
ACCURACY AND GROUNDING
==================================================

Use ONLY information contained in the supplied contract analysis.

Do not invent:

- Clauses
- Dates
- Amounts
- Obligations
- Rights
- Penalties
- Deadlines
- Parties
- Legal conclusions
- Facts that are not present in the analysis

If the analysis does not contain enough information to answer the question,
say so clearly.

If the question refers to something that appears to be missing from the
analysis, explain that the available analysis does not provide enough
information.

If the analysis contains ambiguity or conflicting information, point that
out instead of guessing.

If the question asks for an interpretation, distinguish between:

- What the contract explicitly states
- What the provision appears to mean
- Any uncertainty or ambiguity

Do not present uncertain interpretations as definite facts.

==================================================
LEGAL DISCLAIMER BEHAVIOR
==================================================

You are providing contract-analysis assistance, not formal legal advice.

Do not unnecessarily add a legal disclaimer to every answer.

Only mention that professional legal advice may be appropriate when the
question involves significant legal uncertainty, a potentially serious
legal consequence, or an interpretation that cannot reliably be determined
from the supplied information.

==================================================
CONVERSATIONAL BEHAVIOR
==================================================

Be friendly, helpful, and conversational.

The user may ask follow-up questions using words such as:

- "What about this?"
- "Is that bad?"
- "Can they do that?"
- "Why?"
- "Explain that"
- "What happens if I refuse?"
- "What should I look out for?"
- "Is this normal?"

Interpret these questions using the supplied contract context.

Do not force the user to use legal terminology.

Explain legal or contractual terminology when necessary.

If the user asks a simple question, give a simple answer.

If the user asks for a detailed explanation, provide a detailed explanation.

If the question involves meaningful contractual risk, provide enough context
for the user to understand why it matters.

Do not unnecessarily summarize unrelated sections of the contract.

==================================================
IMPORTANT
==================================================

The analysis JSON is the source of truth for this conversation.

Do not pretend that you have access to the original PDF unless the required
information is present in the supplied analysis.

Answer the question based on the information available.

Return ONLY valid JSON.

Use exactly this structure:

{
  "answer": "Natural, clear, conversational answer to the user's question.",
  "confidence": "high" | "medium" | "low",
  "relevant_categories": [
    "category name"
  ]
}

The "answer" should contain the complete response the frontend can display
directly to the user.

The "confidence" should represent how confidently the supplied contract
analysis supports the answer:

- high = clearly supported by the analysis
- medium = reasonably supported but has some ambiguity or limited context
- low = insufficient or ambiguous information

"relevant_categories" should contain only the categories that are actually
relevant to the user's question.

Return JSON only.
`;

    const result = await this.requestLLM(prompt);

    return typeof result === "string" ? JSON.parse(result) : result;
  }
}
