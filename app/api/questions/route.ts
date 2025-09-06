import { NextResponse } from "next/server";
import { QuestionsInputZ, QuestionsJsonSchema, type QuestionsResult } from "@/lib/schemas";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `You are an AI Transformation Consultant analyzing a business for AI opportunities.

IMPORTANT: You MUST perform extensive web_search about:
1. The specific company (search their website URL and company name)
2. Their industry trends and AI adoption in their sector
3. Competitors in their market and their AI usage
4. Latest AI tools relevant to their tech stack and challenges
5. Industry-specific pain points and AI solutions

Use diverse, reputable sources from the last 180 days.
Return JSON that matches the provided schema exactly.
Place all discovered links in the sources array (minimum 5 sources).

Generate 8-10 highly specific questions that will uncover deep AI opportunities.
Questions MUST be tailored to their exact industry, company size, and current challenges.
Include questions about their competitors, market position, and specific processes.
Mix multiple-choice and open-text questions.`;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  if (!checkRate(ip).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = QuestionsInputZ.parse(body);

    const userPrompt = `CRITICAL: Perform deep web research about this specific business before generating questions.

Business Facts:
Company Name: ${input.companyInfo.companyName}
Website URL: ${input.companyInfo.websiteURL || 'Not provided'}
Industry: ${input.companyInfo.industry}
Number of Employees: ${input.companyInfo.employees || 'Not specified'}
Annual Revenue: ${input.companyInfo.revenue || 'Not specified'}

Current Technology Stack:
CRM System: ${input.techStack.crmSystem || 'None specified'}
Current AI Tools in Use: ${input.techStack.aiTools || 'None'}
Biggest Business Challenge: ${input.techStack.biggestChallenge || 'Not specified'}

Social Media & Marketing:
Active Channels: ${input.socialMedia.channels?.join(', ') || 'None'}
Content Creation Time/Week: ${input.socialMedia.contentTime || 'Not specified'}

REQUIRED RESEARCH ACTIONS:
1. Search the company website URL to understand their business model and services
2. Research their industry for AI adoption trends and competitor analysis
3. Identify specific AI solutions for their stated biggest challenge
4. Find AI tools that integrate with their CRM system
5. Research AI content creation tools for their social media channels

Generate a comprehensive summary and 8-10 highly specific questions that will uncover deep AI transformation opportunities for THIS exact business.`;

    const result = await callResponses<QuestionsResult>({
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: QuestionsJsonSchema,
      tools: [{ type: "web_search" }],
      model: process.env.OPENAI_MODEL || "gpt-4o-mini"
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Questions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 400 }
    );
  }
}