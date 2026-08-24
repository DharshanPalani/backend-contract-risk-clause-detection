import { LLM_prompt } from "../prompt.js";

export class LLMService {
  async callLLM(data: string) {
    const prompt = `
    ${LLM_prompt}
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

        // reasoning_effort: "high",

        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `DeepSeek API error: ${response.status} ${await response.text()}`,
      );
    }

    const result: any = await response.json();

    const content = result.choices[0].message.content;

    // console.log(content);
    // const formatted = JSON.stringify(JSON.parse(content), null, 4);

    // fs.writeFile("data.json", formatted, "utf8", () => {
    //   console.log("Data written");
    // });

    return content;
  }
}
