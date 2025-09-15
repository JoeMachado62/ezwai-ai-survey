import { NextResponse } from "next/server";
import { ReportInputZ } from "@/lib/schemas";
import { HtmlReportJsonSchema, HTML_SYSTEM_PROMPT, buildHtmlUserPrompt, type HtmlReportResult } from "@/lib/html-report-schema";
import { callResponses } from "@/lib/openai";
import { checkRate } from "@/lib/rateLimit";
import { getSupabaseAdmin } from '@/lib/supabase';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to replace image placeholders with actual URLs and wrap in complete HTML
function processHtmlImages(html: string): string {
  // Use absolute URLs for images so they work when HTML is served directly
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezwai-ai-survey-production.up.railway.app';
  
  const imageMap: Record<string, string> = {
    '[IMAGE:executive]': process.env.NEXT_PUBLIC_REPORT_IMAGE_EXECUTIVE || `${baseUrl}/images/executive-summary.jpg`,
    '[IMAGE:quickwins]': process.env.NEXT_PUBLIC_REPORT_IMAGE_QUICKWINS || `${baseUrl}/images/quick-wins.jpg`,
    '[IMAGE:recommendations]': process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || `${baseUrl}/images/roadmap.jpg`,
    '[IMAGE:competitive]': process.env.NEXT_PUBLIC_REPORT_IMAGE_COMPETITIVE || `${baseUrl}/images/competitive.jpg`,
    '[IMAGE:roadmap]': process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || `${baseUrl}/images/roadmap.jpg`,
    '[IMAGE:nextsteps]': process.env.NEXT_PUBLIC_REPORT_IMAGE_IMPLEMENTATION || `${baseUrl}/images/implementation.jpg`,
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
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 30px; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #08b2c6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Your AI Opportunities Report is Ready!</h1>
                </div>
                <div class="content">
                  <p>Hi ${emailDetails.firstName || 'there'},</p>
                  <p>Your comprehensive AI Opportunities Report for ${input.companyInfo.companyName || 'your business'} has been generated.</p>
                  
                  ${reportUrl ? `
                  <center style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #f0feff, #e6fafe); border-radius: 12px;">
                    <h2 style="color: #08b2c6; margin-bottom: 20px;">Your Report is Ready!</h2>
                    <a href="${reportUrl}" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #08b2c6, #0891a1); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
                      📊 View Your Report Now
                    </a>
                  </center>
                  ` : `
                  <p><strong>Your report has been generated successfully.</strong></p>
                  <p>For immediate access to your report, please contact our team at joe@ezwai.com with your company name: ${input.companyInfo.companyName}</p>
                  `}
                  
                  <p>Best regards,<br>The EZWAI Team</p>
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