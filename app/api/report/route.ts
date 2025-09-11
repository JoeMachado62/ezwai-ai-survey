import { NextResponse } from "next/server";
import { ReportInputZ, ReportJsonSchema, type ReportResult } from "@/lib/schemas";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";
import { generateReportPdf } from "@/lib/generateReportPdf";

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
    
    // Extract email parameters if provided (for skip-wait functionality)
    const { sendEmailWhenComplete, emailDetails, ...reportInput } = body;
    
    const input = ReportInputZ.parse(reportInput);

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
${Object.entries(input.answers || {}).map(([q, a]) => {
  // Handle both single values and arrays from multi-select questions
  const answer = Array.isArray(a) ? a.join(', ') : a;
  return `Q: ${q}\nA: ${answer}`;
}).join('\n\n')}

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

    // Check if API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log("Using mock report - OpenAI API key not configured");
      
      // Return a personalized mock report for testing
      const mockReport: ReportResult = {
        executiveSummary: `AI Opportunities Report for ${input.companyInfo.companyName || 'Your Company'}\n\nBased on our analysis of your ${input.companyInfo.industry || 'industry'} business with ${input.companyInfo.employees || 'your'} employees, we've identified significant AI transformation opportunities that could address your primary challenge: "${input.techStack.biggestChallenge || 'operational efficiency'}".`,
        quickWins: [
          {
            title: "Automate Customer Support with AI",
            description: `Implement an AI chatbot integrated with ${input.techStack.crmSystem || 'your CRM'} to handle 60% of routine customer inquiries automatically`,
            timeframe: "2-4 weeks",
            impact: "30% reduction in support response time, 50% cost savings"
          },
          {
            title: "AI-Powered Content Generation",
            description: `Leverage AI tools to create content for ${input.socialMedia.channels?.join(', ') || 'your social media channels'}, reducing the ${input.socialMedia.contentTime || '10+'} hours per week you currently spend`,
            timeframe: "1-2 weeks", 
            impact: "75% reduction in content creation time"
          },
          {
            title: "Intelligent Document Processing",
            description: "Use AI to extract data from documents, invoices, and forms automatically",
            timeframe: "3-4 weeks",
            impact: "80% faster document processing"
          }
        ],
        recommendations: [
          {
            title: "Implement Predictive Analytics Platform",
            description: `Deploy machine learning models tailored to ${input.companyInfo.industry} to forecast trends and optimize operations`,
            roi: "25-35% improvement in forecast accuracy"
          },
          {
            title: "AI-Driven Process Automation",
            description: `Create an automation strategy specifically targeting: "${input.techStack.biggestChallenge}"`,
            roi: "40% reduction in manual processing time"
          }
        ],
        competitiveAnalysis: `In the ${input.companyInfo.industry || 'your'} industry, AI early adopters are gaining 20-40% efficiency improvements. Companies of your size (${input.companyInfo.employees || 'similar employee count'}) are particularly well-positioned to implement AI quickly and see immediate ROI. Your current use of ${input.techStack.crmSystem || 'existing systems'} provides a solid foundation for AI integration.`,
        nextSteps: [
          `Schedule a consultation to address: "${input.techStack.biggestChallenge}"`,
          `Evaluate AI tools that integrate with ${input.techStack.crmSystem || 'your current CRM'}`,
          "Conduct an AI readiness assessment for your team",
          "Create a 6-month AI implementation roadmap",
          "Start with Quick Win #1 for immediate impact"
        ],
        sources: [
          { title: `Analysis based on ${input.companyInfo.companyName} business profile`, url: "https://example.com/analysis" },
          { title: `${input.companyInfo.industry} industry AI adoption trends 2024`, url: "https://example.com/industry-trends" },
          { title: "McKinsey Global AI Survey 2024", url: "https://www.mckinsey.com/ai-survey" },
          { title: "Gartner AI Implementation Guide for SMBs", url: "https://www.gartner.com/ai-guide" }
        ]
      };
      
      return NextResponse.json(mockReport, { status: 200 });
    }

    // Try actual API call if key is configured
    console.log("[Report API] Starting GPT-5 report generation...");
    console.log(`[Report API] Company: ${input.companyInfo.companyName}, Industry: ${input.companyInfo.industry}`);
    console.log(`[Report API] Model: ${process.env.OPENAI_MODEL_REPORT || "gpt-5"}`);
    
    try {
      const result = await callResponses<ReportResult>({
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        schema: ReportJsonSchema,
        tools: [{ type: "web_search" }],
        model: process.env.OPENAI_MODEL_REPORT || "gpt-5",  // Use full GPT-5 for complex reasoning and broad knowledge
        reasoning_effort: "low",  // Reduced to prevent timeouts while still enabling web search
        verbosity: "medium"  // Balanced output for faster generation
      });

      console.log("[Report API] Successfully generated report");
      
      // ALWAYS send email with the report - this is now standard
      if (emailDetails?.email) {
        console.log("[Report API] Sending report via email to:", emailDetails.email);
        
        try {
          // Import SendGrid directly instead of making internal API call
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          
          // Generate PDF attachment
          let pdfAttachment;
          try {
            const pdfBuffer = await generateReportPdf(
              result,
              input.companyInfo.companyName || 'Your Company',
              emailDetails.firstName
            );
            pdfAttachment = {
              content: pdfBuffer.toString('base64'),
              filename: `AI_Opportunities_Report_${input.companyInfo.companyName || 'Company'}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment'
            };
            console.log("[Report API] PDF generated successfully for attachment");
          } catch (pdfError) {
            console.error("[Report API] PDF generation failed:", pdfError);
            // Continue without attachment if PDF fails
          }
          
          // Create email HTML with report summary
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 30px; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #08b2c6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                .highlight { background: #f0f9ff; padding: 15px; border-left: 4px solid #08b2c6; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Your AI Opportunities Report is Ready!</h1>
                </div>
                <div class="content">
                  <p>Hi ${emailDetails.firstName || 'there'},</p>
                  
                  <p>Great news! Your personalized AI Opportunities Report for <strong>${input.companyInfo.companyName}</strong> has been generated and is attached to this email as a PDF.</p>
                  
                  <div class="highlight">
                    <h3>Executive Summary:</h3>
                    <p>${result.executiveSummary?.substring(0, 300)}...</p>
                  </div>
                  
                  <h3>Your Report Includes:</h3>
                  <ul>
                    <li>🚀 ${result.quickWins?.length || 0} Quick Wins you can implement in 30 days</li>
                    <li>📊 Strategic AI recommendations for your ${input.companyInfo.industry} business</li>
                    <li>🎯 Competitive intelligence and market insights</li>
                    <li>📋 Step-by-step implementation guide</li>
                  </ul>
                  
                  <h3>Top Quick Win:</h3>
                  ${result.quickWins?.[0] ? `
                    <p><strong>${result.quickWins[0].title}</strong><br>
                    ${result.quickWins[0].description}<br>
                    <em>Impact: ${result.quickWins[0].impact}</em></p>
                  ` : ''}
                  
                  <center>
                    <a href="https://ezwai.com/scheduling-calendar/" class="button">Schedule Your Free Consultation</a>
                  </center>
                  
                  <div class="footer">
                    <p><strong>Questions?</strong> Simply reply to this email and I'll personally respond within 24 hours.</p>
                    <p>Best regards,<br>
                    The EZWAI Team<br>
                    <a href="https://ezwai.com">ezwai.com</a></p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;
          
          const msg: any = {
            to: emailDetails.email,
            from: 'joe@ezwai.com',
            bcc: ['jeriz@ezwai.com', 'joemachado62@gmail.com'], // BCC to both for lead notification and testing
            subject: `${emailDetails.firstName}, Your AI Opportunities Report is Ready!`,
            html: emailHtml
          };
          
          // Add PDF attachment if it was generated
          if (pdfAttachment) {
            msg.attachments = [pdfAttachment];
            console.log("[Report API] PDF attachment added to email");
          }
          
          await sgMail.send(msg);
          console.log("[Report API] Email sent successfully to:", emailDetails.email);
          console.log("[Report API] BCC sent to jeriz@ezwai.com and joemachado62@gmail.com for lead notification");
          console.log("[Report API] This validates the email and starts conversation thread");
        } catch (emailError) {
          console.error("[Report API] Error sending email:", emailError);
          // Don't fail the report generation if email fails
        }
      } else {
        console.warn("[Report API] No email provided - report generated but not sent");
      }
      
      return NextResponse.json(result, { status: 200 });
    } catch (apiError: any) {
      console.error("OpenAI API error, using fallback:", apiError.message);
      
      // Return basic fallback report on API error
      const fallbackReport: ReportResult = {
        executiveSummary: `AI Analysis for ${input.companyInfo.companyName}\n\nYour ${input.companyInfo.industry} business shows strong potential for AI transformation.`,
        quickWins: [{
          title: "Start with AI Automation",
          description: "Begin your AI journey with simple automation tools",
          timeframe: "2-4 weeks",
          impact: "20% efficiency improvement"
        }],
        recommendations: [{
          title: "Develop AI Strategy",
          description: "Create a comprehensive AI adoption plan for your organization",
          roi: "30% operational improvement"
        }],
        competitiveAnalysis: "AI adoption in your industry is accelerating rapidly.",
        nextSteps: ["Contact us for detailed analysis", "Review industry-specific AI tools"],
        sources: [
          { title: "Industry research", url: "https://example.com/research" },
          { title: "AI market analysis", url: "https://example.com/market-analysis" },
          { title: "AI implementation best practices", url: "https://example.com/best-practices" }
        ]
      };
      
      return NextResponse.json(fallbackReport, { status: 200 });
    }
  } catch (error: any) {
    console.error("Report API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 400 }
    );
  }
}