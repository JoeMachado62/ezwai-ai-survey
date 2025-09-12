import { NextResponse } from "next/server";
import { generatePuppeteerPdf } from "@/lib/generatePuppeteerPdf";
import type { ReportSection } from "@/lib/report-types";

// Transform report data into sections for the PDF generator
function transformToSections(companyName: string): ReportSection[] {
  return [
    {
      title: "Executive Summary",
      mainContent: `**AI Transformation Overview for ${companyName}**\n\nBased on our comprehensive analysis, we've identified significant opportunities to leverage AI and GoHighLevel's platform.\n\n**Key Opportunities:**\n• Implement GoHighLevel's Conversational AI for 24/7 lead capture\n• Deploy automated social media lead generation workflows\n• Create intelligent email sequences with behavior-based triggers`,
      keyTakeaways: [
        "GoHighLevel can increase your lead generation by 40-60% within 30 days",
        "AI automation can reduce manual follow-up time by 75%",
        "Integrated CRM and marketing automation eliminates the need for multiple tools"
      ],
      pullQuote: "Companies using GoHighLevel's AI features report 3x higher conversion rates",
      statistic: {
        value: "287%",
        description: "Average ROI for businesses using GoHighLevel"
      },
      imageUrl: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/682e45427b03233d423f353f.webp"
    },
    {
      title: "Quick Wins - 30 Day Implementation",
      mainContent: `**1. GoHighLevel AI Chatbot Deployment**\nImplement GoHighLevel's Conversational AI on your website to qualify leads 24/7.\n\n**2. Automated Review Management**\nUse GoHighLevel's reputation management tools.\n\n**3. Smart Email & SMS Campaigns**\nSet up AI-driven sequences.`,
      keyTakeaways: [
        "All quick wins can be implemented within GoHighLevel's platform",
        "No additional software or integrations required"
      ],
      imageUrl: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb055f7235614c5090e379.webp"
    }
  ];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company') || 'Test Company';
    
    console.log("[Test PDF] Generating magazine-style PDF with images using Puppeteer...");
    
    // Generate mock sections
    const testSections = transformToSections(companyName);
    
    // Generate PDF using Puppeteer for full HTML rendering with images
    const pdfBuffer = await generatePuppeteerPdf(testSections, companyName);
    
    console.log("[Test PDF] PDF generated successfully, size:", pdfBuffer.length, "bytes");
    
    // Return the PDF directly
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${companyName.replace(/\s+/g, '_')}_Test_Report.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
    
  } catch (error: any) {
    console.error("[Test PDF] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate PDF", 
        details: error.message
      },
      { status: 500 }
    );
  }
}