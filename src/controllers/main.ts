import type { Request, Response } from "express";
import multer from "multer";
import { ExtractorService } from "../services/extractor.js";
import { LLMService } from "../services/llm.js";

export class MainController {
  public upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed"));
      }
    },
  });

  private extractorService = new ExtractorService();
  private llmService = new LLMService();

  async review(request: Request, response: Response) {
    const file = request.file;

    if (!file) {
      return response.status(400).json({
        error: "PDF file is required",
      });
    }

    const extracted = await this.extractorService.extractPDF(file.buffer);

    const contractText = extracted.pages
      .map((page) => `--- Page ${page.pageNumber} ---\n${page.content}`)
      .join("\n\n");

    // console.log(contractText);

    // return response.status(201).send("DONE!");

    const USE_LLM = process.env.DEV_MODE;

    if (USE_LLM == "false") {
      const result = {
        risk_percentage: 38,
        summary:
          "This employment agreement is generally balanced, with reasonable compensation and termination terms. The main areas requiring attention are post-employment confidentiality and intellectual property provisions.",
        display_summary: "Generally balanced contract with minor concerns",
        risk_categories: [
          {
            category: "payment",
            risk_percentage: 20,
            clauses: [
              {
                clause:
                  "The Employee shall receive a gross monthly salary of INR 45,000, payable on or before the 7th day of each calendar month. Statutory deductions, including applicable taxes and other legally required deductions, may be made from the Employee's salary. Any salary revision, bonus, or additional benefit shall be communicated separately in writing.",
                display_text:
                  "Fixed monthly salary of INR 45,000, paid by the 7th, with standard deductions possible.",
                risk: 20,
              },
            ],
          },
          {
            category: "termination",
            risk_percentage: 30,
            clauses: [
              {
                clause:
                  "After completion of probation, either the Employer or the Employee may terminate the employment by providing 30 days' written notice.",
                display_text:
                  "Either side can end employment with 30 days' notice after probation.",
                risk: 20,
              },
              {
                clause:
                  "The Employer may terminate employment without notice where permitted by applicable law in cases of serious misconduct, fraud, material breach of employment obligations, or other lawful grounds for summary termination.",
                display_text:
                  "Employer can fire without notice for serious misconduct, fraud, or material breach.",
                risk: 40,
              },
              {
                clause:
                  "The Employee shall be paid all salary and other amounts legally due up to the effective date of termination.",
                display_text:
                  "Employee gets all salary and legal dues through the termination date.",
                risk: 10,
              },
            ],
          },
          {
            category: "obligations",
            risk_percentage: 25,
            clauses: [
              {
                clause:
                  "The Employee shall be employed as a Software Developer, commencing on 1 September 2026. The Employee shall report to the manager designated by the Employer and shall perform the duties reasonably associated with the position, together with other reasonable duties consistent with the Employee's skills and role.",
                display_text:
                  "Employee works as a Software Developer and must perform reasonable duties as assigned.",
                risk: 20,
              },
              {
                clause:
                  "The Employee shall ordinarily work 40 hours per week, Monday through Friday. Any additional working hours shall be handled in accordance with applicable law and the Employer's policies.",
                display_text:
                  "Standard 40-hour workweek; extra hours follow law and company policy.",
                risk: 10,
              },
              {
                clause:
                  "The Employee shall be subject to a probationary period of three months from the commencement date. During probation, either party may terminate the employment by providing 14 days' written notice, subject to applicable law. Upon satisfactory completion of probation, the Employee shall continue in employment under the terms of this Agreement.",
                display_text:
                  "Three-month probation; either side can end with 14 days' notice.",
                risk: 25,
              },
              {
                clause:
                  "The Employee shall be entitled to leave and public holidays in accordance with applicable law and the Employer's applicable leave policy. The Employer shall communicate the applicable leave entitlement and procedure to the Employee.",
                display_text:
                  "Leave and holidays follow law and company policy.",
                risk: 10,
              },
              {
                clause:
                  "The Employee shall comply with reasonable Company policies communicated to the Employee. Company policies may be updated from time to time, provided that such policies do not override the express terms of this Agreement or applicable law unless the Employee and Employer otherwise agree in writing where required.",
                display_text:
                  "Employee must follow company policies, which can change as long as they don't override the agreement.",
                risk: 40,
              },
              {
                clause:
                  "The Employee shall disclose any actual conflict of interest that could materially interfere with the Employee's duties. The Employee may undertake lawful outside activities provided that they do not materially interfere with employment duties, misuse Company resources or confidential information, or create an undisclosed conflict of interest.",
                display_text:
                  "Employee must disclose conflicts; outside activities allowed if they don't interfere or misuse company resources.",
                risk: 30,
              },
              {
                clause:
                  "Reasonable business expenses incurred by the Employee on behalf of the Employer shall be reimbursed in accordance with the Employer's expense policy, provided appropriate documentation is submitted.",
                display_text:
                  "Reasonable work expenses are reimbursed per policy with documentation.",
                risk: 10,
              },
            ],
          },
          {
            category: "confidentiality",
            risk_percentage: 50,
            clauses: [
              {
                clause:
                  "During and after employment, the Employee shall maintain the confidentiality of the Employer's non-public business and technical information. Confidential information includes, where applicable, source code, credentials, customer information, business plans, technical documentation, financial information, trade secrets, and other information reasonably understood to be confidential. This obligation shall not apply to information that becomes publicly available through no breach by the Employee or that the Employee is legally required to disclose.",
                display_text:
                  "Must keep company secrets confidential during and after employment, with some exceptions.",
                risk: 50,
              },
            ],
          },
          {
            category: "intellectual_property",
            risk_percentage: 50,
            clauses: [
              {
                clause:
                  "All work product specifically created by the Employee in the course and scope of employment for the Employer shall belong to the Employer to the extent permitted by applicable law. The Employer shall not claim ownership over the Employee's pre-existing works, independent projects, or general skills and knowledge that were developed outside the scope of employment and without use of the Employer's confidential resources. The Employee shall disclose any pre-existing intellectual property incorporated into work performed for the Employer.",
                display_text:
                  "Work done on the job belongs to the employer, but pre-existing and independent work stays yours.",
                risk: 50,
              },
            ],
          },
          {
            category: "liability",
            risk_percentage: 35,
            clauses: [
              {
                clause:
                  "The Employee shall comply with reasonable information-security policies and applicable data-protection requirements. The Employee shall take reasonable measures to protect Company systems, credentials, confidential information, and personal data accessed during employment. Any suspected security incident or unauthorized disclosure shall be reported promptly to the Employer.",
                display_text:
                  "Must follow security policies, protect company data, and report any incidents.",
                risk: 35,
              },
            ],
          },
          {
            category: "other",
            risk_percentage: 20,
            clauses: [
              {
                clause:
                  "The parties shall first attempt to resolve any employment-related dispute through good-faith discussion. If the dispute cannot be resolved internally, the parties may pursue the remedies available under applicable law. Nothing in this Agreement prevents either party from exercising rights or remedies that cannot lawfully be excluded.",
                display_text:
                  "Disputes should first be discussed in good faith; legal remedies remain available.",
                risk: 20,
              },
              {
                clause:
                  "This Agreement shall be governed by the laws applicable in India, together with applicable employment laws and regulations.",
                display_text: "Indian law governs this agreement.",
                risk: 10,
              },
              {
                clause:
                  "Any material amendment to this Agreement shall be made in writing and communicated to both parties.",
                display_text:
                  "Any important changes must be in writing and shared with both parties.",
                risk: 20,
              },
            ],
          },
        ],
      };
      return response.json(result);
    }

    const result = await this.llmService.callLLM(contractText);

    return response.json(result);

    return response.status(201).send("work");
  }
}
