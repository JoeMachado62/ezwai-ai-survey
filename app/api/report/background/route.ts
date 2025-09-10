import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      firstName,
      lastName,
      companyInfo,
      techStack,
      socialMedia,
      answers,
      report
    } = body;

    // Start background processing
    // In production, this would be handled by a queue system (e.g., BullMQ, AWS SQS)
    
    // Simulate async processing
    setImmediate(async () => {
      try {
        console.log(`Starting background report processing for ${email}`);
        
        // Step 1: Generate enhanced report with images
        const reportSections = transformReportToSections(report, companyInfo);
        
        const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/report/generate-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportData: reportSections })
        });
        
        const imageData = await imageResponse.json();
        const enhancedReport = imageData.enhancedReport;
        
        // Step 2: Generate PDF (would need a server-side PDF generator)
        // For now, we'll simulate this
        const reportPdfBase64 = await generatePdfBase64(enhancedReport, companyInfo);
        
        // Step 3: Send email with PDF
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            companyName: companyInfo.companyName,
            reportPdfBase64,
            reportData: report,
            skipWait: true
          })
        });
        
        console.log(`Background report processing completed for ${email}`);
        
      } catch (error) {
        console.error('Background processing error:', error);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Report processing started in background"
    });

  } catch (error) {
    console.error("Background processing error:", error);
    return NextResponse.json(
      { error: "Failed to start background processing" },
      { status: 500 }
    );
  }
}

// Helper function to transform report (copied from main page)
function transformReportToSections(report: any, companyInfo: any): any[] {
  const sections: any[] = [];
  
  const summaryKeywords = report.executiveSummary.slice(0, 200);
  
  sections.push({
    title: "Executive Summary",
    mainContent: report.executiveSummary,
    imagePrompt: `Create a professional business visualization for ${companyInfo.companyName} in the ${companyInfo.industry} industry. 
                  Focus on: ${summaryKeywords}. 
                  Style: Modern tech-inspired design with blue (#08b2c6) and teal (#b5feff) gradients.`,
    pullQuote: "Your AI transformation journey starts here",
    keyTakeaways: [
      `Tailored for ${companyInfo.companyName}`,
      `${report.quickWins.length} immediate opportunities identified`,
      `Industry-specific recommendations`
    ]
  });
  
  if (report.quickWins.length > 0) {
    const quickWinTitles = report.quickWins.map((w: any) => w.title).join(', ');
    
    sections.push({
      title: "Quick Wins - 30 Day Implementation",
      mainContent: report.quickWins.map((win: any) => 
        `**${win.title}**\n${win.description}\n*Timeframe: ${win.timeframe} | Impact: ${win.impact}*`
      ).join('\n\n'),
      imagePrompt: `Create a dynamic visualization showing AI quick wins: ${quickWinTitles}`,
      statistic: {
        value: `${report.quickWins.length}`,
        description: "Immediate AI opportunities"
      },
      keyTakeaways: report.quickWins.map((win: any) => win.title)
    });
  }
  
  if (report.recommendations.length > 0) {
    sections.push({
      title: "Strategic AI Roadmap",
      mainContent: report.recommendations.map((rec: any) => 
        `**${rec.title}**\n${rec.description}\n*Expected ROI: ${rec.roi}*`
      ).join('\n\n'),
      imagePrompt: `Design a futuristic roadmap visualization showing AI integration phases`,
      pullQuote: report.recommendations[0]?.roi || "Significant ROI potential",
      keyTakeaways: report.recommendations.map((rec: any) => rec.title)
    });
  }
  
  sections.push({
    title: "Competitive Intelligence",
    mainContent: report.competitiveAnalysis,
    imagePrompt: `Create a competitive landscape visualization with market positioning`,
    statistic: {
      value: "20-40%",
      description: "Average efficiency gain from AI adoption"
    }
  });
  
  sections.push({
    title: "Your Implementation Roadmap",
    mainContent: "Here's your personalized action plan:\n\n" + report.nextSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n'),
    imagePrompt: `Illustrate a clear action plan with numbered steps`,
    keyTakeaways: report.nextSteps.slice(0, 3)
  });
  
  return sections;
}

// Placeholder for PDF generation (would need proper implementation)
async function generatePdfBase64(enhancedReport: any, companyInfo: any): Promise<string> {
  // In production, use a library like Puppeteer or pdf-lib to generate PDF
  // For now, return a placeholder
  console.log('Generating PDF for:', companyInfo.companyName);
  return "base64_pdf_content_placeholder";
}