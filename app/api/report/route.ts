import { NextResponse } from "next/server";
import { ReportInputZ, ReportJsonSchema, type ReportResult } from "@/lib/schemas";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `You are a senior AI Transformation Consultant creating a customized report for a specific client.

YOUR APPROACH:
1. Synthesize ALL provided data to understand their unique situation
2. Research current AI solutions specific to their industry and challenges
3. Provide recommendations scaled to their company size and revenue
4. Focus on their stated biggest challenge as the primary opportunity
5. Consider their current tech stack for integration recommendations

REPORT REQUIREMENTS:

1. EXECUTIVE SUMMARY:
   - Reference their company name and industry
   - Acknowledge their specific challenge
   - Highlight 2-3 major AI opportunities unique to them

2. QUICK WINS (2-3 immediate implementations):
   - Must address their stated biggest challenge
   - Include tools that integrate with their existing CRM if specified
   - Provide specific tool names, not generic categories
   - Include realistic timeframes for their company size
   - Estimate impact based on their revenue level

3. STRATEGIC RECOMMENDATIONS (2-3 long-term initiatives):
   - Scale appropriately to their employee count and revenue
   - Industry-specific AI solutions, not generic ones
   - Include ROI projections relevant to their business size

4. COMPETITIVE ANALYSIS:
   - Research their specific industry competitors
   - How AI adoption varies by company size in their sector
   - Specific advantages they can gain

5. NEXT STEPS (3-5 concrete actions):
   - Prioritized based on their biggest challenge
   - Specific to their tech stack and tools
   - Actionable within their likely budget

Use web_search to find:
- Industry-specific AI adoption rates and success stories
- Competitors in their exact market
- AI tools that integrate with their specific CRM
- Solutions for their stated challenge

Return JSON with 5-8 sources from your research.`;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  if (!checkRate(ip).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = ReportInputZ.parse(body);

    const userPrompt = `Create a personalized AI Opportunities Report for ${input.companyInfo.companyName || 'this company'}.

==== CLIENT PROFILE ====
Company: ${input.companyInfo.companyName || 'Not specified'}
Website: ${input.companyInfo.websiteURL || 'Not provided'}
Industry: ${input.companyInfo.industry || 'Not specified'}
Size: ${input.companyInfo.employees || 'Unknown'} employees
Annual Revenue: ${input.companyInfo.revenue || 'Not disclosed'}

==== CURRENT STATE ====
CRM System: ${input.techStack.crmSystem || 'None specified'}
Existing AI Tools: ${input.techStack.aiTools || 'None currently'}
Biggest Challenge: "${input.techStack.biggestChallenge || 'Not specified'}"

==== MARKETING PROFILE ====
Active Channels: ${input.socialMedia.channels?.join(', ') || 'None'}
Content Time: ${input.socialMedia.contentTime || 'Not specified'} per week
${input.socialMedia.channels?.length ? `This indicates opportunity for AI content generation on ${input.socialMedia.channels.join(' and ')}.` : ''}

==== AI READINESS ASSESSMENT ====
${input.aiSummary || 'Assessment pending'}

==== DETAILED RESPONSES ====
${Object.entries(input.answers || {}).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}

==== CRITICAL FOCUS AREAS ====
1. PRIMARY: Solutions for "${input.techStack.biggestChallenge || 'operational efficiency'}"
2. INTEGRATION: ${input.techStack.crmSystem ? `AI tools that work with ${input.techStack.crmSystem}` : 'Platform-agnostic solutions'}
3. SCALE: Recommendations appropriate for ${input.companyInfo.employees || 'a company'} with ${input.companyInfo.revenue || 'their revenue level'}
4. INDUSTRY: Specific to ${input.companyInfo.industry || 'their industry'} sector

==== RESEARCH PRIORITIES ====
- Search for "${input.companyInfo.companyName} ${input.companyInfo.industry}" to understand their market position
- Find AI solutions for "${input.techStack.biggestChallenge}" in ${input.companyInfo.industry || 'their industry'}
- Research "${input.techStack.crmSystem} AI integration" if CRM is specified
- Look for ${input.companyInfo.industry} industry AI adoption rates and competitor analysis

Create a report that feels like it was written specifically for THIS company, not a generic template.`;

    const result = await callResponses<ReportResult>({
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: ReportJsonSchema,
      tools: [{ type: "web_search" }],
      model: process.env.OPENAI_MODEL_REPORT || "gpt-5"  // Use full GPT-5 for complex reasoning and broad knowledge
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