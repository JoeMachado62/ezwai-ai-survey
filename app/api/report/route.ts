import { NextResponse } from "next/server";
import { ReportInputZ } from "@/lib/schemas";
import { HtmlReportJsonSchema, HTML_SYSTEM_PROMPT, buildHtmlUserPrompt, type HtmlReportResult } from "@/lib/html-report-schema";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";
import { getSupabaseAdmin } from '@/lib/supabase';
import sgMail from '@sendgrid/mail';

// Extended timeout for comprehensive GPT-5 reports
export const maxDuration = 600; // 10 minutes for Railway/Vercel

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to replace image placeholders with actual URLs and wrap in complete HTML
function processHtmlImages(html: string): string {
  // Use absolute URLs for images so they work when HTML is served directly
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezwai-ai-survey-production.up.railway.app';
  
  // Map image placeholders to environment variables - matches exact section order
  const imageMap: Record<string, string> = {
    // Section 1: Executive Summary
    '[IMAGE:executive]': process.env.NEXT_PUBLIC_REPORT_IMAGE_EXECUTIVE || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68c0f9d6fc36707db01f8ff6.jpeg',

    // Section 2: Quick Wins
    '[IMAGE:quickwins]': process.env.NEXT_PUBLIC_REPORT_IMAGE_QUICKWINS || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a42c4db7a3e6bafee331e.jpeg',

    // Section 3: Strategic AI Roadmap
    '[IMAGE:roadmap]': process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a588388de253b412b435d.jpeg',

    // Section 4: Competitive Intelligence
    '[IMAGE:competitive]': process.env.NEXT_PUBLIC_REPORT_IMAGE_COMPETITIVE || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f910657f02bf1e88160.jpeg',

    // Section 5: Your Implementation Roadmap
    '[IMAGE:implementation]': process.env.NEXT_PUBLIC_REPORT_IMAGE_IMPLEMENTATION || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91cac6682b0fc37eeb.jpeg',

    // Section 6: Next Steps
    '[IMAGE:fallback]': process.env.NEXT_PUBLIC_REPORT_IMAGE_FALLBACK || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68c0f9d6fc3670b8d41f8ff7.jpeg',

    // Legacy mappings (for backwards compatibility)
    '[IMAGE:nextsteps]': process.env.NEXT_PUBLIC_REPORT_IMAGE_FALLBACK || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68c0f9d6fc3670b8d41f8ff7.jpeg',
    '[IMAGE:recommendations]': process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a588388de253b412b435d.jpeg'
  };
  
  let processedHtml = html;
  Object.entries(imageMap).forEach(([placeholder, url]) => {
    // For hero sections, just replace the placeholder
    processedHtml = processedHtml.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      url
    );
  });
  
  // Ensure the HTML is wrapped in a complete document structure
  if (!processedHtml.includes('<!DOCTYPE html>')) {
    processedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Opportunities Report</title>
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${processedHtml}
</body>
</html>`;
  }
  
  return processedHtml;
}

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

    // Build the user prompt with full context
    const userPrompt = buildHtmlUserPrompt(
      input.companyInfo,
      input.techStack,
      input.socialMedia,
      input.aiSummary,
      input.answers,
      input.questions
    );

    // Check if API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log("Using mock HTML report - OpenAI API key not configured");
      
      const mockHtmlReport = `
        <div style="max-width:1200px; margin:0 auto; padding:20px; font-family:system-ui, -apple-system, sans-serif; background:#f9fafb;">
          <div style="height:400px; background:linear-gradient(135deg, #08b2c6, #ff6b35); display:flex; align-items:center; justify-content:center; color:white; border-radius:16px; margin-bottom:32px;">
            <div style="text-align:center;">
              <h1 style="font-size:48px; margin:0;">${input.companyInfo.companyName || 'Your Company'}</h1>
              <p style="font-size:24px; margin-top:16px;">AI Transformation Report</p>
            </div>
          </div>
          
          <div style="background:white; padding:40px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.1); margin-bottom:24px;">
            <h2 style="color:#08b2c6; font-size:32px;">Executive Summary</h2>
            <p>Based on our analysis of ${input.companyInfo.companyName}, we've identified significant AI opportunities in ${input.companyInfo.industry}.</p>
            <p>Your biggest challenge: "${input.techStack.biggestChallenge}" can be addressed through strategic AI implementation.</p>
          </div>
          
          <div style="background:#e0f7ff; border-left:4px solid #08b2c6; padding:24px; margin:24px 0; border-radius:8px;">
            <strong style="color:#08b2c6;">💡 Key Insight:</strong> Companies in ${input.companyInfo.industry} using AI see 30-40% efficiency improvements.
          </div>
        </div>
      `;
      
      const mockResult: HtmlReportResult = {
        htmlReport: mockHtmlReport,
        sources: [
          { title: "McKinsey AI Report 2024", url: "https://mckinsey.com/ai" },
          { title: "Industry AI Adoption Study", url: "https://example.com/study" }
        ]
      };
      
      return NextResponse.json(mockResult, { status: 200 });
    }

    // Try actual API call with HTML generation
    console.log("[Report API] Starting GPT-5 HTML report generation...");
    console.log(`[Report API] Company: ${input.companyInfo.companyName}, Industry: ${input.companyInfo.industry}`);
    console.log(`[Report API] Model: ${process.env.OPENAI_MODEL_REPORT || "gpt-5"}`);
    
    try {
      const result = await callResponses<HtmlReportResult>({
        input: [
          { role: "system", content: HTML_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        schema: HtmlReportJsonSchema,
        tools: [{ type: "web_search" }],
        model: process.env.OPENAI_MODEL_REPORT || "gpt-5",  // Use full GPT-5 for production
        reasoning_effort: "low",  // Required for web search
        verbosity: "medium"  // Balanced output
      });

      console.log("[Report API] Successfully generated HTML report");
      
      // Process images in the HTML
      const processedHtml = processHtmlImages(result.htmlReport);
      
      // Save to Supabase if configured
      let reportUrl = '';
      let reportId = '';
      let supabaseSaved = false;
      
      // Check if Supabase is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const supabaseAdmin = getSupabaseAdmin();
          const { data, error } = await supabaseAdmin
            .from('reports')
            .insert({
              company_name: input.companyInfo.companyName || 'Unknown Company',
              email: emailDetails?.email || '',
              report_data: {
                businessInfo: input.companyInfo,
                contactInfo: {
                  firstName: emailDetails?.firstName,
                  lastName: emailDetails?.lastName,
                  email: emailDetails?.email
                },
                htmlReport: processedHtml,  // Store processed HTML
                sources: result.sources,
                questions: input.questions || [],
                answers: input.answers || {},
                techStack: input.techStack,
                socialMedia: input.socialMedia,
                aiSummary: input.aiSummary
              }
            })
            .select()
            .single();

          if (!error && data) {
            reportId = data.id;
            reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ezwai-ai-survey-production.up.railway.app'}/r/${data.id}`;
            supabaseSaved = true;
            console.log('Report saved to Supabase with ID:', reportId);
          } else {
            console.error('Failed to save report to Supabase:', error);
          }
        } catch (err) {
          console.error('Error saving to Supabase:', err);
          // Continue without Supabase - report is still generated
        }
      } else {
        console.log('Supabase not configured - skipping save');
      }
      
      // Send email if requested (even without Supabase URL)
      if (emailDetails?.email) {
        console.log("[Report API] Sending report via email to:", emailDetails.email);
        
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 32px; }
                .subheader { color: rgba(255,255,255,0.95); margin-top: 10px; font-size: 18px; }
                .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .highlight-box { background: linear-gradient(135deg, #f0feff, #e6fafe); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; }
                .cta-button { display: inline-block; padding: 20px 50px; background: linear-gradient(135deg, #08b2c6, #0891a1); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 20px; box-shadow: 0 4px 15px rgba(8, 178, 198, 0.3); }
                .benefit-list { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .benefit-list li { margin: 10px 0; }
                .urgency-box { background: #fff3cd; border-left: 4px solid #ff6b35; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚀 Your AI Transformation Report is Ready!</h1>
                  <div class="subheader">Personalized opportunities identified for ${input.companyInfo.companyName}</div>
                </div>
                <div class="content">
                  <p style="font-size: 18px;"><strong>Hi ${emailDetails.firstName || 'there'},</strong></p>

                  <p style="font-size: 16px;">Thank you for completing our AI Assessment! I'm excited to share that we've completed a comprehensive analysis of <strong>${input.companyInfo.companyName}</strong> and identified <strong>several immediate opportunities</strong> where AI can transform your operations.</p>

                  <div class="highlight-box">
                    <h2 style="color: #08b2c6; margin-bottom: 20px; font-size: 28px;">📊 Your Custom Report is Ready!</h2>
                    <p style="font-size: 16px; margin-bottom: 25px;">Click below to access your interactive report with beautiful visualizations:</p>
                    <a href="${reportUrl}" class="cta-button">
                      View Your AI Opportunities Report →
                    </a>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                      💡 Tip: You can download a PDF version directly from the report page
                    </p>
                  </div>

                  <h3 style="color: #1f2937; margin-top: 30px;">What's Inside Your Report:</h3>
                  <div class="benefit-list">
                    <ul style="list-style: none; padding: 0;">
                      <li>✅ <strong>Executive Summary</strong> tailored specifically to ${input.companyInfo.industry || 'your industry'}</li>
                      <li>🚀 <strong>Quick Wins</strong> you can implement within 30 days</li>
                      <li>📈 <strong>Strategic AI Roadmap</strong> with ROI projections</li>
                      <li>🎯 <strong>Competitive Analysis</strong> showing how AI can give you an edge</li>
                      <li>📋 <strong>Step-by-step Implementation Guide</strong> with specific tools</li>
                      <li>💰 <strong>Cost-Benefit Analysis</strong> for each recommendation</li>
                    </ul>
                  </div>

                  <div class="urgency-box">
                    <strong>⚠️ Don't Wait to Review Your Report</strong><br>
                    Our research shows that ${input.companyInfo.industry || 'businesses in your industry'} implementing AI now are seeing 20-40% efficiency gains. The gap between AI-enabled businesses and traditional ones is widening daily.
                  </div>

                  <h3 style="color: #1f2937; margin-top: 30px;">Your Next Step: Free Strategy Session</h3>
                  <p>I'd love to discuss your report findings and help you implement these AI solutions. <strong>Schedule your free 30-minute consultation</strong> where we'll:</p>
                  <ul>
                    <li>Review your top 3 AI opportunities in detail</li>
                    <li>Answer your implementation questions</li>
                    <li>Create a 90-day action plan</li>
                    <li>Explore how our done-for-you services can accelerate your AI adoption</li>
                  </ul>

                  <center style="margin: 30px 0;">
                    <a href="https://ezwai.com/scheduling-calendar/" style="display: inline-block; padding: 16px 40px; background: #ff6b35; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                      📅 Schedule Your Free Strategy Session
                    </a>
                  </center>

                  <p style="background: #f0feff; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
                    <strong style="color: #08b2c6;">Quick Question?</strong><br>
                    Simply reply to this email and I'll personally respond within 24 hours.<br>
                    You can also reach me directly at <a href="mailto:joe@ezwai.com">joe@ezwai.com</a>
                  </p>

                  <div class="footer">
                    <p><strong>Best regards,</strong><br>
                    Joe Machado<br>
                    Founder, EZWAI<br>
                    <a href="https://ezwai.com">ezwai.com</a> | <a href="mailto:joe@ezwai.com">joe@ezwai.com</a></p>

                    <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                      P.S. The average business using AI saves 10-20 hours per week on repetitive tasks. <br>
                      <a href="${reportUrl}" style="color: #08b2c6;">View your report now</a> to see how much time you could save.
                    </p>

                    <p style="font-size: 11px; color: #9ca3af; margin-top: 15px;">
                      You received this email because you completed the AI Opportunities Assessment at ezwai.com. <br>
                      We respect your privacy and will never share your information.
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
            bcc: ['joe@ezwai.com', 'jeriz@ezwai.com'],  // BCC for tracking
            subject: `${emailDetails.firstName}, Your AI Opportunities Report is Ready!`,
            html: emailHtml
          };
          
          await sgMail.send(msg);
          console.log("[Report API] Email sent successfully");
        } catch (emailError) {
          console.error("[Report API] Email sending failed:", emailError);
        }
      }
      
      return NextResponse.json({
        success: true,
        htmlReport: processedHtml,
        sources: result.sources,
        reportUrl: reportUrl,
        reportId: reportId
      });
      
    } catch (apiError: any) {
      console.error("[Report API] GPT-5 API error:", apiError);
      throw apiError;
    }

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}