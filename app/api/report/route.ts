import { NextResponse } from "next/server";
import { ReportInputZ, ReportJsonSchema, type ReportResult } from "@/lib/schemas";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `You are an AI Transformation Consultant.
ALWAYS perform web_search before finalizing answers to find current industry benchmarks and AI success stories.
Use diverse, reputable sources. Prefer items from the last 180 days.
Return JSON that matches the provided schema exactly.
Include 3-8 sources in the sources array.
Create a comprehensive AI Opportunities Report with:
1. Executive Summary - A high-level overview of AI opportunities
2. Quick Wins - 2-3 immediate AI implementations with specific timeframes and impact
3. Recommendations - 2-3 strategic AI initiatives with ROI assessment
4. Competitive Analysis - How AI can improve their competitive position
5. Next Steps - 3-5 concrete action items to begin their AI transformation`;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  if (!checkRate(ip).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = ReportInputZ.parse(body);

    const userPrompt = `Create an AI Opportunities Report from this context:

Business Information:
${JSON.stringify(input.companyInfo, null, 2)}

Tech Stack:
${JSON.stringify(input.techStack, null, 2)}

Social Media:
${JSON.stringify(input.socialMedia, null, 2)}

AI Assessment Summary:
${input.aiSummary}

Survey Responses:
${JSON.stringify(input.answers, null, 2)}

Generate a comprehensive report with specific, actionable recommendations tailored to this business.`;

    const result = await callResponses<ReportResult>({
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: ReportJsonSchema,
      tools: [{ type: "web_search" }],
      model: process.env.OPENAI_MODEL_REPORT || process.env.OPENAI_MODEL || "gpt-5"
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Report API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 400 }
    );
  }
}