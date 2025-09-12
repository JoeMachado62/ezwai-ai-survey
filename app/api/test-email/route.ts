import { NextResponse } from "next/server";
import { generateReportPdf } from "@/lib/generateReportPdf";
import type { ReportResult } from "@/lib/schemas";

// Mock report data for testing
const mockReport: ReportResult = {
  executiveSummary: "This is a test executive summary for cARLUCENT, an automobile broker specializing in vehicle buyer services. Based on your challenge with lead generation, we've identified several AI-powered opportunities to transform your business operations and customer acquisition strategy.",
  quickWins: [
    {
      title: "Implement AI-Powered Lead Capture Chatbot",
      description: "Deploy an intelligent chatbot on your website that qualifies leads 24/7, answers common questions about vehicle sourcing, and schedules consultations automatically. This can integrate with your existing CRM to track lead sources and conversion rates.",
      timeframe: "2-3 weeks",
      impact: "40-60% increase in qualified leads"
    },
    {
      title: "Automate Social Media Lead Generation",
      description: "Use AI tools to monitor social media for people discussing car purchases, automatically engage with relevant posts, and direct them to your services. Tools like Phantom Buster can automate LinkedIn and Facebook outreach.",
      timeframe: "1-2 weeks",
      impact: "25-30 new leads per week"
    },
    {
      title: "Smart Email Campaign Automation",
      description: "Set up AI-driven email sequences that nurture leads based on their behavior and interests. Use tools like ActiveCampaign to send personalized vehicle recommendations and market updates.",
      timeframe: "1 week",
      impact: "3x improvement in email engagement"
    }
  ],
  recommendations: [
    {
      title: "Build Predictive Lead Scoring System",
      description: "Implement machine learning models to score and prioritize leads based on likelihood to convert. This helps focus your efforts on high-value prospects and optimize your sales process.",
      roi: "35% increase in conversion rate"
    },
    {
      title: "Create AI-Powered Vehicle Matching Engine",
      description: "Develop a recommendation system that matches buyers with ideal vehicles based on their preferences, budget, and needs. This can differentiate your service from competitors.",
      roi: "50% reduction in search time, 2x client satisfaction"
    }
  ],
  competitiveAnalysis: "In the automobile broker industry, early AI adopters are seeing significant advantages. Companies using AI for lead generation report 40-70% more qualified leads. Your competitors may already be using basic chatbots, but comprehensive AI integration for lead scoring, automated outreach, and predictive analytics remains rare, giving you an opportunity to leapfrog the competition.",
  nextSteps: [
    "Here's your personalized action plan:",
    "1. Schedule a demo with Intercom or Drift for chatbot implementation",
    "2. Set up Phantom Buster for social media automation",
    "3. Configure ActiveCampaign for email automation",
    "4. Implement Google Analytics 4 with AI insights",
    "5. Review weekly metrics and optimize AI tools based on performance"
  ],
  sources: []
};

// Helper function to sanitize text for PDF generation
function sanitizeForPDF(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018-\u201F]/g, "'")
    .replace(/[\u201C-\u201D]/g, '"')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[\u2022]/g, '•')
    .replace(/[\u2013]/g, '-')
    .replace(/[\u2014]/g, '--')
    .replace(/[\u00AD]/g, '')
    .replace(/[\u200B-\u200F]/g, '')
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

export async function POST(request: Request) {
  try {
    const { email, firstName, companyName } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    console.log("[Test Email] Generating PDF with mock data...");
    
    // Sanitize the mock report data for PDF generation
    const sanitizedReport: ReportResult = {
      executiveSummary: sanitizeForPDF(mockReport.executiveSummary),
      quickWins: mockReport.quickWins?.map(qw => ({
        title: sanitizeForPDF(qw.title),
        description: sanitizeForPDF(qw.description),
        timeframe: sanitizeForPDF(qw.timeframe),
        impact: sanitizeForPDF(qw.impact)
      })) || [],
      recommendations: mockReport.recommendations?.map(rec => ({
        title: sanitizeForPDF(rec.title),
        description: sanitizeForPDF(rec.description),
        roi: sanitizeForPDF(rec.roi)
      })) || [],
      competitiveAnalysis: sanitizeForPDF(mockReport.competitiveAnalysis),
      nextSteps: mockReport.nextSteps?.map(step => sanitizeForPDF(step)) || [],
      sources: []
    };
    
    // Generate PDF
    const pdfBuffer = await generateReportPdf(
      sanitizedReport,
      sanitizeForPDF(companyName) || 'Test Company',
      sanitizeForPDF(firstName) || 'Test User'
    );
    
    console.log("[Test Email] PDF generated, size:", pdfBuffer.length, "bytes");
    
    // Send email with SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 14px 32px; background: #08b2c6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Test Email - AI Report</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName || 'there'},</p>
            <p>This is a <strong>TEST EMAIL</strong> to verify PDF attachment functionality.</p>
            <p>The attached PDF contains mock data for testing purposes only.</p>
            <p>Company: ${companyName || 'Test Company'}</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <div class="footer">
              <p><strong>EZWAI Test System</strong><br>
              This is a test email - please ignore if received unexpectedly.<br>
              📧 joe@ezwai.com | 📱 888-503-9924</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const msg: any = {
      to: email,
      from: 'joe@ezwai.com',
      subject: `[TEST] AI Report PDF Test - ${new Date().toLocaleTimeString()}`,
      html: emailHtml,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `TEST_AI_Report_${Date.now()}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };
    
    console.log("[Test Email] Sending email to:", email);
    await sgMail.send(msg);
    console.log("[Test Email] Email sent successfully!");
    
    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully",
      pdfSize: pdfBuffer.length,
      recipient: email
    });
    
  } catch (error: any) {
    console.error("[Test Email] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send test email", 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}