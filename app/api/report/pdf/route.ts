import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { report, companyName } = await req.json();
    
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const tealColor = rgb(0.031, 0.698, 0.776);
    const orangeColor = rgb(1, 0.42, 0.067);
    const blackColor = rgb(0, 0, 0);
    const grayColor = rgb(0.3, 0.3, 0.3);
    
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let yPosition = height - 50;
    
    page.drawText("AI Opportunities Report", {
      x: 50,
      y: yPosition,
      size: 24,
      font: helveticaBold,
      color: tealColor,
    });
    yPosition -= 30;
    
    page.drawText(companyName || "Your Company", {
      x: 50,
      y: yPosition,
      size: 18,
      font: helvetica,
      color: blackColor,
    });
    yPosition -= 40;
    
    page.drawText("Executive Summary", {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: orangeColor,
    });
    yPosition -= 25;
    
    const summaryLines = wrapText(report.executiveSummary || "", 80);
    for (const line of summaryLines) {
      if (yPosition < 100) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: blackColor,
      });
      yPosition -= 15;
    }
    
    const pdfBytes = await pdfDoc.save();
    
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="AI_Opportunities_${companyName || "Report"}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  
  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}
