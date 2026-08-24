import fs from "fs";

export class LLMService {
  async callLLM(data: string) {
    const prompt = `
You are a contract analysis engine.

Your task is to analyze the provided raw contract text and return a structured JSON representation of the risks and clauses found in the contract.

The contract may be any type of agreement, including but not limited to:

- Employment agreements
- Freelance agreements
- Service agreements
- Vendor agreements
- Client agreements
- Tender agreements
- Lease or rental agreements
- NDAs
- Consulting agreements
- Partnership agreements
- Purchase agreements
- Licensing agreements
- Contractor agreements
- Other commercial or personal agreements

The analysis MUST be contract-type neutral.

Do not assume that the contract is an employment agreement.

Do not assume that the person reviewing the contract is an employee, employer, client, tenant, landlord, freelancer, vendor, bidder, or any other specific party.

Analyze the contract based on the actual rights, obligations, restrictions, liabilities, financial exposure, and balance between the parties.

The output will be stored in a database and displayed in a frontend application.

Return ONLY valid JSON.
Do not return Markdown.
Do not return explanations outside the JSON.
Do not wrap the JSON in a code block.

==================================================
OVERALL SUMMARY
==================================================

The root-level "summary" field must provide a concise explanation of the overall contract.

Rules:

1. Keep it to 1-2 sentences maximum.
2. Explain the overall nature and risk profile of the contract.
3. Mention the most important risk factors when they exist.
4. Do not list every clause.
5. Do not provide legal advice.
6. Do not repeat the risk percentage.
7. Do not use LOW, MEDIUM, or HIGH as a risk label.
8. Do not make claims that are not supported by the contract.
9. Keep the wording understandable to a normal user.

Example:

"This employment agreement is generally balanced, with reasonable compensation and termination terms. The main areas requiring attention are post-employment restrictions and intellectual property provisions."

Another example:

"The agreement contains several provisions that create significant financial and termination-related exposure. Payment conditions and unilateral cancellation rights require particular attention."

==================================================
DISPLAY SUMMARY
==================================================

The root-level "display_summary" field is a very short frontend-friendly description of the overall contract risk.

Rules:

1. Keep it approximately 6-7 words.
2. Keep it concise and natural.
3. Describe the overall risk impression.
4. Do not include the numerical risk percentage.
5. Do not use LOW, MEDIUM, or HIGH.
6. Do not provide legal advice.
7. Do not mention individual clauses.
8. Make it understandable at a glance.

Examples:

"Generally balanced contract with minor concerns"

"Contract contains several notable risk areas"

"Mostly balanced agreement with limited concerns"

"Several significant contractual risks require attention"

"Generally favorable terms with limited exposure"

"Contract contains substantial financial and legal exposure"

"Balanced agreement with a few restrictions"

==================================================
RISK PERCENTAGE
==================================================

Every risk value must be an integer from 0 to 100.

The risk percentage represents the level of contractual concern associated with the relevant provision.

Use the following interpretation:

0-49:
Low concern.

50-74:
Medium concern.

75-100:
High concern.

IMPORTANT:

Do NOT output the words:

LOW
MEDIUM
HIGH

Only output numerical percentages.

The frontend will determine the displayed category from the percentage.

Examples:

25 = low concern
49 = low concern
50 = medium concern
65 = medium concern
74 = medium concern
75 = high concern
90 = high concern

==================================================
OVERALL CONTRACT RISK
==================================================

"risk_percentage" at the root level represents the overall level of contractual concern.

Do NOT calculate the overall risk by simply averaging every clause.

Consider:

- Severity of the most important provisions.
- Number of materially concerning provisions.
- Financial exposure.
- Restrictions imposed by the contract.
- Imbalance between parties.
- Duration of significant obligations.
- Unilateral powers.
- Liability exposure.
- Termination conditions.
- Payment conditions.
- Other material contractual risks.

A normal and balanced contract should generally have a relatively low overall risk percentage.

A contract containing several substantial and one-sided provisions should have a significantly higher percentage.

Do not increase the overall risk merely because the contract is long.

Do not increase the overall risk merely because the contract contains many ordinary clauses.

==================================================
RISK CATEGORIES
==================================================

Group related clauses into broad, useful categories that a person reviewing the contract would actually want to see.

IMPORTANT:

The contract MUST contain a maximum of 7 categories.

NEVER return more than 7 categories.

Prefer approximately 6-7 broad categories when the contract contains enough relevant material.

Do NOT create a separate category for every individual clause or contract section.

Combine closely related subjects.

Examples:

salary + payment + deductions + bonuses
→ "payment"

termination + resignation + notice period + cancellation
→ "termination"

confidentiality + confidential information + security obligations
→ "confidentiality"

intellectual property + ownership + licensing + personal projects
→ "intellectual_property"

liability + indemnification + damages + financial responsibility
→ "liability"

working hours + leave + duties + performance requirements
→ "obligations"

non_compete + non_solicitation + exclusivity + post-contract restrictions
→ "restrictions"

Preferred broad categories include:

payment
termination
obligations
confidentiality
intellectual_property
liability
restrictions

These are NOT mandatory.

Choose categories based on the actual contract.

Possible additional categories include:

dispute_resolution
renewal
contract_duration
data_protection
property
delivery
warranty
other

However:

NEVER exceed 7 total categories.

==================================================
CATEGORY SELECTION
==================================================

Before generating the JSON, identify the major subjects in the contract.

Then combine related subjects into broad categories.

Do not create categories for minor or isolated provisions.

Do not create a category merely because one sentence mentions a subject.

Prioritize categories based on:

1. Importance of the subject.
2. Number of relevant clauses.
3. Potential contractual impact.
4. Practical usefulness in the frontend.

If multiple subjects can reasonably fit under an existing category, combine them.

If a minor subject does not fit naturally into another category, use "other" instead of creating another category.

NEVER create more than 7 categories.

NEVER create duplicate categories.

==================================================
CATEGORY RISK
==================================================

Each category must have a "risk_percentage".

This represents the overall level of contractual concern associated with the clauses grouped under that category.

The category risk should be based on the actual clauses inside the category.

Do not assign a high percentage merely because the category exists.

A normal and balanced clause should generally have a relatively low risk.

A clause containing excessive discretion, significant financial exposure, unusually broad restrictions, or substantial imbalance should have a higher risk.

==================================================
CLAUSE RISK
==================================================

Each clause must have its own "risk" integer from 0 to 100.

The risk must be based on the actual wording and practical effect of that clause.

Consider:

- Scope.
- Duration.
- Financial impact.
- One-sidedness.
- Restrictions.
- Discretion granted to either party.
- Liability.
- Penalties.
- Ambiguity.
- Whether the provision is unusually broad.
- Whether important limitations are absent.
- Whether the provision creates significant contractual exposure.

Do NOT flag a clause simply because it imposes an obligation.

Do NOT flag a clause simply because one party receives a right.

Assess whether the provision is reasonable within the context of the agreement.

==================================================
CLAUSE TEXT
==================================================

The "clause" field must contain the relevant ORIGINAL text from the contract.

Do not rewrite the clause.

Do not summarize the clause in the "clause" field.

Use the actual contract wording whenever possible.

If a clause spans multiple sentences or paragraphs, include the complete relevant passage.

Do not invent clause text.

Do not alter the meaning of the original text.

==================================================
DISPLAY TEXT
==================================================

Each clause MUST contain a "display_text" field.

"display_text" is a short, frontend-friendly explanation of the clause.

Rules:

1. Keep it to approximately 1-2 short sentences.
2. Prefer a maximum of approximately 25 words.
3. Explain the practical meaning of the clause in simple language.
4. Do not copy the entire original clause.
5. Do not introduce information that is not present in the original clause.
6. Preserve important numbers, dates, durations, amounts, and restrictions when relevant.
7. Do not include a risk percentage in display_text.
8. Avoid unnecessary legal jargon.
9. The display_text must be understandable without reading the original clause.

Example:

Original clause:

"Either party may terminate this Agreement by providing thirty (30) days' prior written notice to the other party."

display_text:

"Either party can end the agreement with 30 days' written notice."

==================================================
IMPORTANT
==================================================

Do not assume something is risky merely because it could theoretically be negotiated.

Do not provide legal advice.

Do not determine whether a clause is legally enforceable.

Do not make jurisdiction-specific legal conclusions.

Analyze contractual risk based only on the supplied text.

Do not invent missing information.

Do not assume a particular party is the reviewer.

Do not favor or protect a specific party.

Evaluate the contract neutrally based on the actual contractual terms.

==================================================
OUTPUT RULES
==================================================

Return ONLY this JSON structure:

{
  "risk_percentage": 0,
  "summary": "One or two sentence summary of the overall contract.",
  "display_summary": "Short frontend-friendly summary",
  "risk_categories": [
    {
      "category": "category_name",
      "risk_percentage": 0,
      "clauses": [
        {
          "clause": "ORIGINAL_CLAUSE_TEXT",
          "display_text": "Short explanation of the clause.",
          "risk": 0
        }
      ]
    }
  ]
}

Rules:

1. "risk_percentage" must be an integer from 0 to 100.

2. "summary" must contain no more than 2 sentences.

3. "display_summary" should contain approximately 6-7 words.

4. "display_summary" must not contain a numerical risk percentage.

5. "display_summary" must not contain LOW, MEDIUM, or HIGH.

6. "risk_categories" must contain only categories actually relevant to the contract.

7. "risk_categories" MUST contain no more than 7 objects.

8. Prefer 6-7 broad categories when the contract contains enough material.

9. Do not create a separate category for every contract section.

10. Combine related subjects into the same category.

11. Do not create categories for minor or isolated topics unless necessary.

12. If a minor topic does not fit naturally into another category, use "other".

13. Never create duplicate categories.

14. "category" must be a short lowercase identifier.

15. Use snake_case when multiple words are required.

16. "category.risk_percentage" must be an integer from 0 to 100.

17. "clauses" must contain one or more relevant clauses.

18. "clause" must contain the original contract text.

19. "display_text" must contain a concise explanation of the clause.

20. "risk" must be an integer from 0 to 100.

21. Do not include LOW, MEDIUM, or HIGH anywhere in the JSON.

22. Do not rank clauses.

23. Do not rank categories.

24. Do not sort clauses by risk.

25. Preserve the general order in which clauses appear in the contract where practical.

26. Do not add recommendations.

27. Do not add explanations outside the JSON.

28. Do not add page numbers.

29. Do not add metadata.

30. Do not add fields that are not present in the specified structure.

31. The final response must be valid JSON.

32. Before returning the response, verify that "risk_categories" contains no more than 7 objects.

33. Verify that every clause has "clause", "display_text", and "risk".

34. Verify that every risk value is an integer between 0 and 100.

35. Verify that "summary" is no more than 2 sentences.

36. Verify that "display_summary" is approximately 6-7 words.

==================================================
FINAL VALIDATION
==================================================

Before producing the final answer, internally verify:

- Is the output valid JSON?
- Are there 7 or fewer categories?
- Are the categories broad rather than overly specific?
- Are related clauses grouped together?
- Does every clause contain original contract text?
- Is every display_text short and understandable?
- Is every risk an integer from 0 to 100?
- Is the overall risk consistent with the most significant provisions?
- Is the analysis neutral rather than employee-specific or party-specific?
- Have normal contractual provisions been avoided being labeled as risky merely because they exist?
- Have LOW/MEDIUM/HIGH labels been excluded?
- Have no additional fields been added?

Return ONLY the final JSON.

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
