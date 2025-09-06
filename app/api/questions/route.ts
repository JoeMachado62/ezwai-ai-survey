import { NextResponse } from "next/server";
import { QuestionsInputZ, QuestionsJsonSchema, type QuestionsResult } from "@/lib/schemas";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `You are an expert AI Transformation Consultant conducting a deep analysis of a specific business.

YOUR APPROACH:
1. First, create a comprehensive profile of the business based on ALL provided information
2. Research their specific company, industry, and competitive landscape
3. Identify pain points based on their stated challenges and industry patterns
4. Generate questions that directly address THEIR unique situation

CRITICAL: Every question must be directly relevant to the specific data provided:
- Company size informs scalability needs
- Revenue level indicates budget capacity
- Current CRM system determines integration requirements
- Stated challenges guide solution priorities
- Social media usage reveals content creation needs
- Industry sector shapes regulatory and competitive considerations

QUESTION REQUIREMENTS:
- 8-10 questions that feel like they were written specifically for THIS company
- Reference their actual industry, tools, and challenges in the questions
- Include competitor comparisons relevant to their market
- Mix formats: multiple choice (with industry-specific options) and open text
- Each question should uncover a specific AI opportunity

Return JSON matching the schema with minimum 5 sources from web research.`;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  if (!checkRate(ip).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = QuestionsInputZ.parse(body);

    const userPrompt = `Analyze this specific business and create personalized AI assessment questions.

==== BUSINESS PROFILE ====
Company: ${input.companyInfo.companyName}
Website: ${input.companyInfo.websiteURL || 'Not provided'}
Industry: ${input.companyInfo.industry}
Size: ${input.companyInfo.employees || 'Not specified'} employees
Revenue: ${input.companyInfo.revenue || 'Not specified'} annually

==== CURRENT TECHNOLOGY ====
CRM Platform: ${input.techStack.crmSystem || 'None'}
Existing AI Tools: ${input.techStack.aiTools || 'None currently'}
Primary Challenge: "${input.techStack.biggestChallenge || 'Not specified'}"

==== MARKETING & CONTENT ====
Active Channels: ${input.socialMedia.channels?.join(', ') || 'None'}
Content Time Investment: ${input.socialMedia.contentTime || 'Not specified'} per week

==== YOUR ANALYSIS TASKS ====
1. COMPANY RESEARCH:
   - Search "${input.companyInfo.companyName}" ${input.companyInfo.websiteURL ? `and visit ${input.companyInfo.websiteURL}` : ''}
   - Understand their business model, services, and market position

2. INDUSTRY ANALYSIS for "${input.companyInfo.industry}":
   - Current AI adoption rates in ${input.companyInfo.industry}
   - Top 3-5 competitors and their AI usage
   - Industry-specific AI solutions and success stories

3. CHALLENGE-SPECIFIC SOLUTIONS for "${input.techStack.biggestChallenge || 'operational efficiency'}":
   - AI tools that directly address this challenge
   - ROI examples from similar ${input.companyInfo.employees ? `${input.companyInfo.employees}-employee` : 'sized'} companies

4. INTEGRATION OPPORTUNITIES:
   ${input.techStack.crmSystem ? `- AI tools that integrate with ${input.techStack.crmSystem}` : '- CRM-agnostic AI solutions'}
   ${input.socialMedia.channels?.length ? `- Content AI for ${input.socialMedia.channels.join(', ')}` : '- General automation opportunities'}

==== OUTPUT REQUIREMENTS ====
First provide a brief summary (2-3 sentences) synthesizing what you learned about THIS specific business.

Then generate 8-10 questions where:
- At least 2 questions reference their specific industry (${input.companyInfo.industry})
- At least 1 question addresses their stated challenge (${input.techStack.biggestChallenge})
- At least 1 question relates to their CRM (${input.techStack.crmSystem}) if specified
- At least 1 question about their social media needs if they use social channels
- Questions feel personalized, not generic
- Multiple choice options are industry-relevant, not generic

Example of a GOOD personalized question:
"As a ${input.companyInfo.industry} company${input.companyInfo.employees ? ` with ${input.companyInfo.employees} employees` : ''}, which of these AI applications would most improve your ${input.techStack.biggestChallenge || 'operations'}?"

Example of a BAD generic question:
"What percentage of your work involves repetitive tasks?"`;

    const result = await callResponses<QuestionsResult>({
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: QuestionsJsonSchema,
      tools: [{ type: "web_search" }],
      model: process.env.OPENAI_MODEL || "gpt-5-mini"  // Use GPT-5-mini for fast, cost-optimized reasoning
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