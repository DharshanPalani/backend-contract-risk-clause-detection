export const template_data = {
  title: "Employment Agreement",
  startDate: "2026-09-01",
  endDate: null,
  risk_percentage: 42,
  summary:
    "This employment agreement is generally balanced with reasonable compensation and termination terms. Potential concerns include confidentiality obligations extending beyond employment and intellectual property assignment.",
  display_summary: "Generally balanced contract with minor concerns",
  report: {
    risk_categories: [
      {
        category: "termination",
        risk_percentage: 35,
        clauses: [
          {
            clause:
              "During probation, either party may terminate the employment by providing 14 days' written notice, subject to applicable law.",
            display_text:
              "During probation, either side can end employment with 14 days' written notice.",
            risk: 30,
          },
          {
            clause:
              "After completion of probation, either the Employer or the Employee may terminate the employment by providing 30 days' written notice.",
            display_text:
              "After probation, either party can terminate with 30 days' notice.",
            risk: 20,
          },
          {
            clause:
              "The Employer may terminate employment without notice where permitted by applicable law in cases of serious misconduct, fraud, material breach of employment obligations, or other lawful grounds for summary termination.",
            display_text:
              "Employer can fire without notice for serious misconduct, fraud, or material breach as allowed by law.",
            risk: 40,
          },
          {
            clause:
              "The Employee shall be paid all salary and other amounts legally due up to the effective date of termination.",
            display_text:
              "Employee will be paid all owed amounts up to termination date.",
            risk: 10,
          },
        ],
      },
      {
        category: "confidentiality",
        risk_percentage: 65,
        clauses: [
          {
            clause:
              "During and after employment, the Employee shall maintain the confidentiality of the Employer's non-public business and technical information. Confidential information includes, where applicable, source code, credentials, customer information, business plans, technical documentation, financial information, trade secrets, and other information reasonably understood to be confidential. This obligation shall not apply to information that becomes publicly available through no breach by the Employee or that the Employee is legally required to disclose.",
            display_text:
              "Employee must keep company secrets even after leaving. Exceptions only if info becomes public or required by law.",
            risk: 65,
          },
        ],
      },
      {
        category: "intellectual_property",
        risk_percentage: 40,
        clauses: [
          {
            clause:
              "All work product specifically created by the Employee in the course and scope of employment for the Employer shall belong to the Employer to the extent permitted by applicable law.",
            display_text: "Work done for the job belongs to the employer.",
            risk: 30,
          },
          {
            clause:
              "The Employer shall not claim ownership over the Employee's pre-existing works, independent projects, or general skills and knowledge that were developed outside the scope of employment and without use of the Employer's confidential resources.",
            display_text:
              "Your pre-existing projects and general skills stay yours.",
            risk: 10,
          },
          {
            clause:
              "The Employee shall disclose any pre-existing intellectual property incorporated into work performed for the Employer.",
            display_text:
              "You must disclose any pre-existing IP you include in your work.",
            risk: 30,
          },
        ],
      },
      {
        category: "obligations",
        risk_percentage: 30,
        clauses: [
          {
            clause:
              "The Employee shall ordinarily work 40 hours per week, Monday through Friday. Any additional working hours shall be handled in accordance with applicable law and the Employer's policies.",
            display_text:
              "Standard workweek is 40 hours, extra hours per law and policy.",
            risk: 20,
          },
          {
            clause:
              "The Employee shall be entitled to leave and public holidays in accordance with applicable law and the Employer's applicable leave policy.",
            display_text: "Leave and holidays follow law and company policy.",
            risk: 15,
          },
          {
            clause:
              "The Employee shall comply with reasonable Company policies communicated to the Employee. Company policies may be updated from time to time, provided that such policies do not override the express terms of this Agreement or applicable law unless the Employee and Employer otherwise agree in writing where required.",
            display_text:
              "Employee must follow reasonable company policies, which may change as long as they don't override the contract or law.",
            risk: 25,
          },
          {
            clause:
              "The Employee shall disclose any actual conflict of interest that could materially interfere with the Employee's duties.",
            display_text:
              "You must disclose conflicts of interest that could affect your job.",
            risk: 20,
          },
          {
            clause:
              "The Employee may undertake lawful outside activities provided that they do not materially interfere with employment duties, misuse Company resources or confidential information, or create an undisclosed conflict of interest.",
            display_text:
              "You can have outside activities if they don't conflict with job or misuse company resources.",
            risk: 20,
          },
          {
            clause:
              "Reasonable business expenses incurred by the Employee on behalf of the Employer shall be reimbursed in accordance with the Employer's expense policy, provided appropriate documentation is submitted.",
            display_text:
              "Reasonable work expenses are reimbursed per policy with documentation.",
            risk: 15,
          },
        ],
      },
      {
        category: "data_protection",
        risk_percentage: 30,
        clauses: [
          {
            clause:
              "The Employee shall comply with reasonable information-security policies and applicable data-protection requirements.",
            display_text:
              "You must follow security policies and data protection laws.",
            risk: 25,
          },
          {
            clause:
              "The Employee shall take reasonable measures to protect Company systems, credentials, confidential information, and personal data accessed during employment.",
            display_text: "You must protect company systems and data.",
            risk: 25,
          },
          {
            clause:
              "Any suspected security incident or unauthorized disclosure shall be reported promptly to the Employer.",
            display_text: "Report any suspected security issue immediately.",
            risk: 30,
          },
        ],
      },
      {
        category: "dispute_resolution",
        risk_percentage: 20,
        clauses: [
          {
            clause:
              "The parties shall first attempt to resolve any employment-related dispute through good-faith discussion. If the dispute cannot be resolved internally, the parties may pursue the remedies available under applicable law. Nothing in this Agreement prevents either party from exercising rights or remedies that cannot lawfully be excluded.",
            display_text:
              "Disputes should be discussed first, then legal remedies are available.",
            risk: 20,
          },
        ],
      },
    ],
  },
};
