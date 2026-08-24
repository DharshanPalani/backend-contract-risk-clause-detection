import { LLM_prompt } from "../prompt.js";

import { HIGHLIGHT_PROMPT } from "../highlight_prompt.js";
import type { HighlightResponse } from "../types/highlight.js";

export class LLMService {
  async callLLM(data: string) {
    const prompt = `
${LLM_prompt}

==================================================
RAW CONTRACT
==================================================

${data}
`;

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
    } catch (error) {
      console.error("Failed to parse DeepSeek JSON:");
      console.error(content);

      throw new Error("DeepSeek returned invalid JSON");
    }
  }

  async generateHighlights(
    pages: {
      pageNumber: number;
      content: string;
    }[],
  ): Promise<HighlightResponse> {
    const pageText = pages
      .map((page) => `--- Page ${page.pageNumber} ---\n${page.content}`)
      .join("\n\n");

    const prompt = `${HIGHLIGHT_PROMPT}

${pageText}`;

    const result = await this.callLLM(prompt);

    const parsed = typeof result === "string" ? JSON.parse(result) : result;

    return parsed as HighlightResponse;
  }
}
