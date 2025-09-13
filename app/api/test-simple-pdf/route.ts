import { NextResponse } from "next/server";
import { generateRailwayPdfBuffer } from "@/lib/generateRailwayPdf";
import type { ReportSection } from "@/lib/report-types";

export async function GET() {
  try {
    console.log("[Simple PDF Test] Starting generation...");
    
    // Very simple test sections
    const testSections: ReportSection[] = [
      {
        title: "Test Section 1",
        mainContent: "This is a simple test of PDF generation. If you can read this, the PDF is working correctly.",
        keyTakeaways: ["Test point 1", "Test point 2"],
        imagePrompt: "Simple test image prompt",
        imageUrl: ""
      },
      {
        title: "Test Section 2", 
        mainContent: "**Bold text test**\n\nRegular paragraph text.\n\n• Bullet point 1\n• Bullet point 2",
        pullQuote: "This is a test quote",
        statistic: {
          value: "100%",
          description: "Success rate"
        },
        imagePrompt: "Another test image prompt",
        imageUrl: ""
      }
    ];
    
    // Generate PDF
    const pdfBuffer = await generateRailwayPdfBuffer(testSections, "Test Company");
    
    console.log(`[Simple PDF Test] Generated ${pdfBuffer.length} bytes`);
    
    // Return the PDF directly as a file download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-simple.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      }
    });
    
  } catch (error: any) {
    console.error("[Simple PDF Test] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}