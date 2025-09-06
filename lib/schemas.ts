import { z } from "zod";

export const QuestionsInputZ = z.object({
  companyInfo: z.object({
    companyName: z.string().min(1),
    websiteURL: z.string().url().optional().or(z.literal("")),
    industry: z.string().min(1),
    employees: z.string().optional(),
    revenue: z.string().optional()
  }),
  techStack: z.object({
    crmSystem: z.string().optional(),
    aiTools: z.string().optional(),
    biggestChallenge: z.string().optional()
  }),
  socialMedia: z.object({
    channels: z.array(z.string()).optional(),
    contentTime: z.string().optional()
  })
});

// GPT-5 Responses API JSON Schema for Questions
export const QuestionsJsonSchema = {
  name: "QuestionsSchema",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "questions", "sources"],
    properties: {
      summary: { type: "string" },
      questions: {
        type: "array",
        minItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "text", "options"],
          properties: {
            type: { type: "string", enum: ["multiple_choice", "text"] },
            text: { type: "string" },
            options: { 
              type: "array", 
              items: { type: "string" } 
            }
          }
        }
      },
      sources: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          required: ["title", "url"],
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            url: { type: "string" }
          }
        }
      }
    }
  }
} as const;

export const ReportInputZ = z.object({
  companyInfo: QuestionsInputZ.shape.companyInfo,
  techStack: QuestionsInputZ.shape.techStack,
  socialMedia: QuestionsInputZ.shape.socialMedia,
  aiSummary: z.string().min(1),
  answers: z.record(z.any())
});

// GPT-5 Responses API JSON Schema for Report
export const ReportJsonSchema = {
  name: "ReportSchema",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["executiveSummary", "quickWins", "recommendations", "competitiveAnalysis", "nextSteps", "sources"],
    properties: {
      executiveSummary: { type: "string" },
      quickWins: {
        type: "array",
        minItems: 2,
        items: {
          type: "object",
          required: ["title", "description", "timeframe", "impact"],
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            timeframe: { type: "string" },
            impact: { type: "string" }
          }
        }
      },
      recommendations: {
        type: "array",
        minItems: 2,
        items: {
          type: "object",
          required: ["title", "description", "roi"],
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            roi: { type: "string" }
          }
        }
      },
      competitiveAnalysis: { type: "string" },
      nextSteps: { 
        type: "array", 
        minItems: 3, 
        maxItems: 5, 
        items: { type: "string" } 
      },
      sources: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          required: ["title", "url"],
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            url: { type: "string" }
          }
        }
      }
    }
  }
} as const;

export type QuestionsInput = z.infer<typeof QuestionsInputZ>;
export type ReportInput = z.infer<typeof ReportInputZ>;

export type GeneratedQuestion = { 
  type: "multiple_choice" | "text"; 
  text: string; 
  options?: string[] 
};

export type QuestionsResult = { 
  summary: string; 
  questions: GeneratedQuestion[]; 
  sources: { title: string; url: string }[] 
};

export type ReportResult = {
  executiveSummary: string;
  quickWins: { title: string; description: string; timeframe: string; impact: string }[];
  recommendations: { title: string; description: string; roi: string }[];
  competitiveAnalysis: string;
  nextSteps: string[];
  sources: { title: string; url: string }[];
};