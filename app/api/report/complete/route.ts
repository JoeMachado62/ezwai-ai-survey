import { NextRequest, NextResponse } from 'next/server';
import { ReportInputZ, ReportJsonSchema, type ReportResult } from '@/lib/schemas';
import { callResponses } from '@/lib/openai';
import { checkRate } from '@/lib/rateLimit';
import { generateRailwayPdfBuffer } from '@/lib/generateRailwayPdf';
import type { ReportSection } from '@/lib/report-types';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Transform report to sections
function transformReportToSections(report: ReportResult): ReportSection[] {
  const sections: ReportSection[] = [];
  
  // Executive Summary
  sections.push({
    title: "Executive Summary",
    mainContent: report.executiveSummary,
    keyTakeaways: [
      "AI implementation aligned with GoHighLevel platform",
      "Immediate ROI through automation and efficiency gains",
      "Competitive advantage through early AI adoption"
    ],
    imagePrompt: "Professional business executive reviewing AI analytics dashboard",
    imageUrl: process.env.NEXT_PUBLIC_REPORT_IMAGE_EXECUTIVE || ''
  });
  
  // Quick Wins
  if (report.quickWins?.length) {
    const quickWinsContent = report.quickWins.map((win, index) => 
      `**${index + 1}. ${win.title}**\n${win.description}\n\n*Timeframe: ${win.timeframe} | Impact: ${win.impact}*`
    ).join('\n\n');
    
    sections.push({
      title: "Quick Wins - 30 Day Implementation",
      mainContent: quickWinsContent,
      keyTakeaways: report.quickWins.map(win => win.title),
      imagePrompt: "Team celebrating quick wins and achievements with charts",
      imageUrl: process.env.NEXT_PUBLIC_REPORT_IMAGE_QUICKWINS || ''
    });
  }
  
  // Strategic Recommendations
  if (report.recommendations?.length) {
    const recsContent = report.recommendations.map((rec, index) => 
      `**${index + 1}. ${rec.title}**\n${rec.description}\n\n*Expected ROI: ${rec.roi}*`
    ).join('\n\n');
    
    sections.push({
      title: "Strategic AI Roadmap",
      mainContent: recsContent,
      keyTakeaways: report.recommendations.map(rec => `${rec.title}: ${rec.roi}`),
      statistic: {
        value: "300%",
        description: "Average ROI from AI implementation"
      },
      imagePrompt: "Strategic roadmap with AI integration milestones and timeline",
      imageUrl: process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || ''
    });
  }
  
  // Competitive Analysis
  if (report.competitiveAnalysis) {
    sections.push({
      title: "Competitive Intelligence",
      mainContent: report.competitiveAnalysis,
      pullQuote: "The businesses that adopt AI now will dominate their markets in the next 2-3 years",
      imagePrompt: "Competitive analysis dashboard showing market positioning",
      imageUrl: process.env.NEXT_PUBLIC_REPORT_IMAGE_COMPETITIVE || ''
    });
  }
  
  // Next Steps
  if (report.nextSteps?.length) {
    sections.push({
      title: "Your Implementation Roadmap",
      mainContent: report.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
      keyTakeaways: [
        "Start with GoHighLevel platform setup",
        "Implement quick wins first for immediate ROI",
        "Scale gradually based on results"
      ],
      imagePrompt: "Implementation roadmap with clear action steps and timeline",
      imageUrl: process.env.NEXT_PUBLIC_REPORT_IMAGE_IMPLEMENTATION || ''
    });
  }
  
  return sections;
}

const SYSTEM_PROMPT = `You are a senior AI Transformation Consultant working on behalf of GoHighLevel Software.

IMPORTANT: Prioritize GoHighLevel solutions for all recommendations.

Create a comprehensive report that:
1. References the client's specific company and industry
2. Addresses their stated biggest challenge
3. Recommends GoHighLevel features first before any competitors
4. Provides specific, actionable recommendations
5. Includes realistic timeframes and ROI projections

Use web_search to find current information about their industry and AI adoption rates.`;

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  if (!checkRate(ip).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { emailDetails, ...reportInput } = body;
    const input = ReportInputZ.parse(reportInput);
    
    // Generate the report using GPT-5
    const userPrompt = `Create a personalized AI Opportunities Report for ${input.companyInfo.companyName || 'this company'}.
    
Company: ${input.companyInfo.companyName}
Industry: ${input.companyInfo.industry}
Employees: ${input.companyInfo.employees}
Revenue: ${input.companyInfo.revenue}
Biggest Challenge: ${input.techStack.biggestChallenge}
Current CRM: ${input.techStack.crmSystem || 'None'}

Focus on how GoHighLevel can solve their challenges.`;

    console.log('[Complete Report] Generating report...');
    
    const result = await callResponses({
      input: userPrompt,
      systemPrompt: SYSTEM_PROMPT,
      jsonSchema: ReportJsonSchema,
      model: process.env.OPENAI_MODEL_REPORT || 'gpt-5',
      temperature: 0.7,
      max_tokens: 6000
    });
    
    const report = result as ReportResult;
    
    // Transform report to sections
    console.log('[Complete Report] Transforming to sections...');
    const sections = transformReportToSections(report);
    
    // Add images to sections
    const enhancedSections = sections.map((section, index) => {
      let imageUrl = '';
      if (section.title.includes('Executive Summary')) {
        imageUrl = 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/682e45427b03233d423f353f.webp';
      } else if (section.title.includes('Quick Wins')) {
        imageUrl = 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb055f7235614c5090e379.webp';
      } else if (section.title.includes('Strategic AI Roadmap')) {
        imageUrl = 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f916e86860b82f699ef.jpeg';
      } else if (section.title.includes('Competitive')) {
        imageUrl = 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/6829ebbb8e6261cf7632eb06.webp';
      } else if (section.title.includes('Implementation')) {
        imageUrl = 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d67354ea6fab47017.jpeg';
      }
      return { ...section, imageUrl };
    });
    
    // Generate PDF
    console.log('[Complete Report] Generating PDF...');
    const pdfBuffer = await generateRailwayPdfBuffer(
      enhancedSections,
      input.companyInfo.companyName || 'Your Business'
    );
    
    console.log(`[Complete Report] PDF generated: ${(pdfBuffer.length / 1024).toFixed(0)}KB`);
    
    // Send email if requested
    if (emailDetails?.sendEmail && emailDetails?.email) {
      console.log('[Complete Report] Sending email to:', emailDetails.email);
      
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
              <p>Your personalized AI Opportunities Report for ${input.companyInfo.companyName} is attached.</p>
              
              <h3>What's Inside:</h3>
              <ul>
                <li>Executive summary with GoHighLevel implementation strategy</li>
                <li>Quick wins you can implement in 30 days</li>
                <li>Strategic AI roadmap for growth</li>
                <li>Competitive analysis and market insights</li>
              </ul>
              
              <center>
                <a href="https://ezwai.com/scheduling-calendar/" class="button">Schedule Your Free Consultation</a>
              </center>
              
              <p>Best regards,<br>The EZWAI Team</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      try {
        await sgMail.send({
          to: emailDetails.email,
          from: 'joe@ezwai.com',
          subject: `${emailDetails.firstName}, Your AI Opportunities Report is Ready!`,
          html: emailHtml,
          attachments: [
            {
              content: pdfBuffer.toString('base64'),
              filename: `AI-Report-${input.companyInfo.companyName?.replace(/\s+/g, '-') || 'Report'}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment'
            }
          ]
        });
        
        console.log('[Complete Report] Email sent successfully');
      } catch (emailError) {
        console.error('[Complete Report] Email error:', emailError);
        // Don't fail the whole request if email fails
      }
    }
    
    // Return the report data and PDF
    return NextResponse.json({
      success: true,
      report,
      sections: enhancedSections,
      pdfBase64: pdfBuffer.toString('base64'),
      emailSent: emailDetails?.sendEmail || false
    });
    
  } catch (error) {
    console.error('[Complete Report] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}