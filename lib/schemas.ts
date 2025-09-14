import { z } from "zod";

export const QuestionsInputZ = z.object({
  companyInfo: z.object({
    companyName: z.string().min(1),
    websiteURL: z.string().optional().transform(val => {
      // Handle empty string or undefined
      if (!val || val === "") return "";
      // Add https:// if no protocol specified
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        val = 'https://' + val;
      }
      // Basic URL validation - just check if it looks like a domain
      if (val.match(/^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)+/)) {
        return val;
      }
      return ""; // Return empty string if invalid
    }),
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
  companyInfo: z.object({
    companyName: z.string().min(1),
    websiteURL: z.string().optional().transform(val => {
      if (!val || val === "") return "";
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        val = 'https://' + val;
      }
      if (val.match(/^https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)+/)) {
        return val;
      }
      return "";
    }),
    industry: z.string().min(1),
    employees: z.string().optional(),
    revenue: z.string().optional()
  }),
  techStack: QuestionsInputZ.shape.techStack,
  socialMedia: QuestionsInputZ.shape.socialMedia,
  aiSummary: z.string().min(1),
  questions: z.array(z.object({
    type: z.enum(["multiple_choice", "text"]),
    text: z.string(),
    options: z.array(z.string()).optional(),
    multiSelect: z.boolean().optional()
  })).optional(),
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
  options?: string[];
  multiSelect?: boolean;
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