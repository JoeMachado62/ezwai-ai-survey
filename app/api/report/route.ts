import { NextResponse } from "next/server";
import { ReportInputZ, ReportJsonSchema, type ReportResult } from "@/lib/schemas";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";
import { generateReportPdf } from "@/lib/generateReportPdf";

// Helper function to sanitize text for PDF generation
function sanitizeForPDF(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    // First replace special characters that can't be encoded in WinAnsi
    .replace(/[\u2010-\u2015]/g, '-') // Various dashes to regular hyphen
    .replace(/[\u2018-\u201F]/g, "'") // Smart quotes to regular quotes
    .replace(/[\u201C-\u201D]/g, '"') // Smart double quotes
    .replace(/[\u2026]/g, '...') // Ellipsis
    .replace(/[\u00A0]/g, ' ') // Non-breaking spaces
    .replace(/[\u2022]/g, '•') // Bullet points
    .replace(/[\u2013]/g, '-') // En dash
    .replace(/[\u2014]/g, '--') // Em dash
    .replace(/[\u00AD]/g, '') // Soft hyphen
    .replace(/[\u200B-\u200F]/g, '') // Zero-width spaces and formatting marks
    
    // Then clean citations and artifacts
    .replace(/cite[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*[a-z0-9_-]*(?:turn\d+|search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/\bturn\d+(?:search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]+/g, '')
    .replace(/\bcite[^.\s,;!?]*\*/gi, '')
    .replace(/\[\d+\]/g, '')
    .replace(/【[\d:]+†source】/g, '')
    .replace(/〔[\d:]+－source〕/g, '')
    .replace(/\s*\*+\s*/g, ' ')
    .replace(/\s*\.\s*\*/g, '.')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/^\s*[•·]\s*/gm, '• ')
    .trim();
}

const SYSTEM_PROMPT = `You are a senior AI Transformation Consultant working on behalf of GoHighLevel Software, creating a customized report for a specific client.

IMPORTANT CONTEXT:
You represent GoHighLevel (GHL), a comprehensive CRM and marketing automation platform that offers:
- AI-powered workflows and automations
- Conversational AI and chatbots
- Content AI for social media and marketing
- Review management automation
- Lead nurturing and pipeline automation
- Email and SMS marketing with AI personalization
- Funnel and website builders with AI assistance
- Appointment scheduling and calendar management
- Reputation management tools
- White-label capabilities for agencies

YOUR APPROACH:
1. Synthesize ALL provided data to understand their unique situation
2. Research current AI solutions specific to their industry and challenges
3. Provide recommendations scaled to their company size and revenue
4. Focus on their stated biggest challenge as the primary opportunity
5. PRIORITIZE GoHighLevel solutions first when applicable, before suggesting competitors

REPORT REQUIREMENTS:

1. EXECUTIVE SUMMARY:
   - Reference their company name and industry
   - Acknowledge their specific challenge
   - Highlight 2-3 major AI opportunities unique to them
   - Subtly emphasize how GoHighLevel can be the central platform for their AI transformation

2. QUICK WINS (2-3 immediate implementations):
   - Must address their stated biggest challenge
   - FIRST consider if GoHighLevel features can solve this (workflow automations, AI chatbots, content AI, etc.)
   - If client already uses a different CRM, suggest how GoHighLevel could complement or replace it
   - Only recommend competitor tools when GoHighLevel genuinely doesn't offer that specific capability
   - Include realistic timeframes for their company size
   - Estimate impact based on their revenue level

3. STRATEGIC RECOMMENDATIONS (2-3 long-term initiatives):
   - Scale appropriately to their employee count and revenue
   - Emphasize GoHighLevel's all-in-one platform benefits vs. multiple disparate tools
   - Position GoHighLevel as the foundation for their AI-powered operations
   - Include ROI projections relevant to their business size

4. COMPETITIVE ANALYSIS:
   - Research their specific industry competitors
   - Highlight how GoHighLevel users in their industry are gaining advantages
   - Show how consolidated platforms like GoHighLevel outperform pieced-together solutions
   - Specific advantages they can gain with our platform

5. NEXT STEPS (3-5 concrete actions):
   - Start with exploring GoHighLevel's capabilities for their needs
   - Suggest a GoHighLevel trial or demo as a primary action
   - Prioritized based on their biggest challenge
   - Actionable within their likely budget

SOLUTION PRIORITIZATION:
When recommending solutions, follow this hierarchy:
1. GoHighLevel native features (always check first)
2. GoHighLevel integrations and marketplace apps
3. Complementary tools that work alongside GoHighLevel
4. Only as last resort: Competitor platforms

Use web_search to find:
- How GoHighLevel is being used in their specific industry
- Success stories of GoHighLevel users with similar challenges
- Industry-specific AI adoption rates
- GoHighLevel features that address their stated challenges

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
${Object.entries(input.answers || {}).map(([qKey, a]) => {
  // Handle both single values and arrays from multi-select questions
  let answer = Array.isArray(a) ? a : [a];
  
  // Smart handling for "All of the above" or "Multiple of the above"
  // Since we don't have the questions here, we'll provide clear context to the AI
  if (answer.some(ans => 
    typeof ans === 'string' && 
    (ans.toLowerCase().includes('all of the above') || 
     ans.toLowerCase().includes('multiple of the above'))
  )) {
    // Make it clear to the AI that this means ALL options apply
    const answerText = answer.join(', ');
    return `Q: ${qKey}\nA: ${answerText} [IMPORTANT: This means the user needs help with ALL the options that were presented in this question, not just one]`;
  }
  
  // Regular answer handling
  const answerText = answer.filter(a => a).join(', ');
  return `Q: ${qKey}\nA: ${answerText}`;
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
            // Sanitize the report data for PDF generation
            const sanitizedReport: ReportResult = {
              executiveSummary: sanitizeForPDF(result.executiveSummary),
              quickWins: result.quickWins?.map(qw => ({
                title: sanitizeForPDF(qw.title),
                description: sanitizeForPDF(qw.description),
                timeframe: sanitizeForPDF(qw.timeframe),
                impact: sanitizeForPDF(qw.impact)
              })) || [],
              recommendations: result.recommendations?.map(rec => ({
                title: sanitizeForPDF(rec.title),
                description: sanitizeForPDF(rec.description),
                roi: sanitizeForPDF(rec.roi)
              })) || [],
              competitiveAnalysis: sanitizeForPDF(result.competitiveAnalysis),
              nextSteps: result.nextSteps?.map(step => sanitizeForPDF(step)) || [],
              sources: result.sources || []
            };
            
            const pdfBuffer = await generateReportPdf(
              sanitizedReport,
              sanitizeForPDF(input.companyInfo.companyName) || 'Your Company',
              sanitizeForPDF(emailDetails.firstName)
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
          
          // Create enhanced marketing email HTML
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f9fafb; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 14px 32px; background: #08b2c6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
                .button-orange { background: #ff6b11; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                .highlight { background: #f0f9ff; padding: 20px; border-left: 4px solid #08b2c6; margin: 20px 0; border-radius: 4px; }
                .stat-box { display: inline-block; padding: 15px 20px; margin: 10px; background: #f8fafc; border-radius: 8px; text-align: center; }
                .stat-number { font-size: 24px; font-weight: bold; color: #08b2c6; }
                .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .testimonial { font-style: italic; color: #4b5563; border-left: 3px solid #e5e7eb; padding-left: 15px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚀 ${emailDetails.firstName}, Your AI Transformation Starts Now!</h1>
                  <p>Your custom AI Opportunities Report for ${input.companyInfo.companyName} is attached</p>
                </div>
                <div class="content">
                  <p style="font-size: 18px;">Hi ${emailDetails.firstName},</p>
                  
                  <p style="font-size: 16px; line-height: 1.6;">
                    Thank you for taking our AI Readiness Assessment! Based on your responses about 
                    <strong>${input.companyInfo.companyName}</strong>'s operations in the 
                    <strong>${input.companyInfo.industry}</strong> industry, we've identified some 
                    <em>remarkable opportunities</em> for AI transformation.
                  </p>
                  
                  <div class="warning">
                    <strong>⚠️ Time-Sensitive:</strong> Your biggest challenge - 
                    "<em>${input.techStack.biggestChallenge}</em>" - is exactly what AI excels at solving. 
                    Every day you wait, competitors gain ground.
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <div class="stat-box">
                      <div class="stat-number">${result.quickWins?.length || 3}</div>
                      <div class="stat-label">Quick Wins</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-number">30</div>
                      <div class="stat-label">Days to ROI</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-number">10+</div>
                      <div class="stat-label">Hours/Week Saved</div>
                    </div>
                  </div>
                  
                  <div class="highlight">
                    <h3 style="margin-top: 0;">🎯 Your #1 Priority Quick Win:</h3>
                    ${result.quickWins?.[0] ? `
                      <p style="font-size: 16px; font-weight: 600; margin: 10px 0;">${result.quickWins[0].title}</p>
                      <p style="margin: 10px 0;">${result.quickWins[0].description}</p>
                      <p style="color: #08b2c6; font-weight: bold;">
                        ⏱ ${result.quickWins[0].timeframe || 'Implementation: 2-4 weeks'} | 
                        📈 ${result.quickWins[0].impact || 'Significant efficiency gains'}
                      </p>
                    ` : `
                      <p>Implement AI-powered automation for your core processes</p>
                      <p style="color: #08b2c6; font-weight: bold;">⏱ 2-4 weeks | 📈 30-50% efficiency improvement</p>
                    `}
                  </div>
                  
                  <div class="testimonial">
                    "After implementing EZWAI's recommendations, we reduced manual tasks by 40% and 
                    increased customer satisfaction scores by 25% in just 60 days."
                    <br><strong>- Recent ${input.companyInfo.industry || 'Industry'} Client</strong>
                  </div>
                  
                  <h3>📎 Your Complete Report Includes:</h3>
                  <ul style="line-height: 1.8;">
                    <li><strong>Executive Summary</strong> - Tailored to ${input.companyInfo.companyName}</li>
                    <li><strong>${result.quickWins?.length || 3} Quick Wins</strong> - Start seeing ROI in 30 days</li>
                    <li><strong>Strategic Roadmap</strong> - Your 90-day AI transformation plan</li>
                    <li><strong>Competitive Analysis</strong> - How you compare in ${input.companyInfo.industry}</li>
                    <li><strong>Implementation Guide</strong> - Step-by-step actions to take today</li>
                  </ul>
                  
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                    <h3 style="color: #92400e; margin-top: 0;">🎁 Limited-Time Offer</h3>
                    <p style="font-size: 16px; margin: 10px 0;">
                      Schedule your <strong>FREE 30-minute AI Strategy Session</strong> this week and receive:
                    </p>
                    <ul style="text-align: left; display: inline-block; margin: 10px 0;">
                      <li>Custom implementation timeline for your quick wins</li>
                      <li>ROI calculator for your specific use case</li>
                      <li>Exclusive access to our AI tools directory</li>
                    </ul>
                    <a href="https://ezwai.com/scheduling-calendar/" class="button button-orange">
                      Claim Your Free Strategy Session →
                    </a>
                  </div>
                  
                  <p style="font-size: 16px; line-height: 1.6;">
                    ${emailDetails.firstName}, companies in ${input.companyInfo.industry || 'your industry'} 
                    are already using AI to ${result.quickWins?.[0] ? result.quickWins[0].title.toLowerCase() : 'transform their operations'}. 
                    Don't let them leave you behind.
                  </p>
                  
                  <center style="margin: 30px 0;">
                    <a href="https://ezwai.com/scheduling-calendar/" class="button">
                      Schedule Your Free Consultation Now
                    </a>
                    <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
                      No obligation • 30 minutes • $500 value
                    </p>
                  </center>
                  
                  <div class="footer">
                    <p><strong>Have questions?</strong> Simply reply to this email - I personally read and respond to every message within 24 hours.</p>
                    <p style="margin-top: 20px;">
                      Looking forward to your AI transformation,<br>
                      <strong>Joe Machado</strong><br>
                      Founder & AI Transformation Expert<br>
                      EZWAI | <a href="https://ezwai.com">ezwai.com</a><br>
                      📧 joe@ezwai.com | 📱 888-503-9924
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                      P.S. The attached PDF contains your complete personalized report. 
                      Review it with your team - the opportunities we've identified could transform your business.
                    </p>
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