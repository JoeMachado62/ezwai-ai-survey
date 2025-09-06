import { NextResponse } from "next/server";
import { QuestionsInputZ, QuestionsJsonSchema, type QuestionsResult } from "@/lib/schemas";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `You are an AI Transformation Consultant.
ALWAYS perform web_search before finalizing answers to ground recommendations with current information.
Use diverse, reputable sources. Prefer items from the last 180 days.
Return JSON that matches the provided schema exactly.
Place all links in the sources array.
Generate 6-10 tailored questions that will help identify specific AI opportunities for this business.
Mix multiple-choice and open-text questions.
Questions should be specific to their industry, size, and challenges.`;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  if (!checkRate(ip).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = QuestionsInputZ.parse(body);

    const userPrompt = `Business Facts:
Company: ${input.companyInfo.companyName}
Website: ${input.companyInfo.websiteURL || 'Not provided'}
Industry: ${input.companyInfo.industry}
Employees: ${input.companyInfo.employees || 'Not specified'}
Revenue: ${input.companyInfo.revenue || 'Not specified'}

Tech Stack:
CRM: ${input.techStack.crmSystem || 'None specified'}
Current AI Tools: ${input.techStack.aiTools || 'None'}
Biggest Challenge: ${input.techStack.biggestChallenge || 'Not specified'}

Social Media:
Channels: ${input.socialMedia.channels?.join(', ') || 'None'}
Content Time/Week: ${input.socialMedia.contentTime || 'Not specified'}

Generate a summary and 6-10 tailored questions to assess their AI opportunities.`;

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