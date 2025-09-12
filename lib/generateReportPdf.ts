import { ReportResult } from './schemas';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateReportPdf(
  report: ReportResult,
  companyName: string,
  firstName?: string
): Promise<Buffer> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Define colors
    const brandTeal = rgb(0.031, 0.698, 0.776); // #08b2c6
    const textGray = rgb(0.29, 0.333, 0.408); // #4a5568
    const titleGray = rgb(0.102, 0.125, 0.173); // #1a202c
    const orange = rgb(1, 0.42, 0.067); // #ff6b11
    const darkGray = rgb(0.2, 0.2, 0.2);
    
    // Load standard fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    // Helper function to wrap and draw text
    function drawWrappedText(
      page: any,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      fontSize: number,
      font: any,
      color: any,
      lineHeight: number = 1.5
    ): number {
      const words = text.split(' ');
      let line = '';
      let yPos = y;
      const actualLineHeight = fontSize * lineHeight;
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && line) {
          page.drawText(line, {
            x,
            y: yPos,
            size: fontSize,
            font,
            color,
          });
          line = word;
          yPos -= actualLineHeight;
        } else {
          line = testLine;
        }
      }
      
      if (line) {
        page.drawText(line, {
          x,
          y: yPos,
          size: fontSize,
          font,
          color,
        });
        yPos -= actualLineHeight;
      }
      
      return yPos;
    }
    
    // Helper function to parse and format text with lists
    function parseAndDrawFormattedText(
      page: any,
      text: string,
      x: number,
      startY: number,
      maxWidth: number,
      fontSize: number,
      font: any,
      boldFont: any,
      color: any
    ): number {
      let yPos = startY;
      
      // Split by potential list patterns or paragraphs
      const lines = text.split(/\n|\. (?=\d+\.)/);
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Check if this is a numbered list item
        const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
        if (numberedMatch) {
          // Draw the number in bold
          page.drawText(`${numberedMatch[1]}.`, {
            x: x + 20,
            y: yPos,
            size: fontSize,
            font: boldFont,
            color: darkGray,
          });
          
          // Draw the list item text
          yPos = drawWrappedText(
            page,
            numberedMatch[2],
            x + 40,
            yPos,
            maxWidth - 40,
            fontSize,
            font,
            color,
            1.4
          );
          yPos -= 8; // Extra space after list item
        }
        // Check for headers ending with colon
        else if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
          // Draw header in bold
          page.drawText(trimmedLine, {
            x,
            y: yPos,
            size: fontSize + 1,
            font: boldFont,
            color: darkGray,
          });
          yPos -= fontSize * 1.8;
        }
        // Check for bullet points
        else if (trimmedLine.match(/^[•·-]\s*(.+)$/)) {
          const bulletMatch = trimmedLine.match(/^[•·-]\s*(.+)$/);
          if (bulletMatch) {
            page.drawText('•', {
              x: x + 20,
              y: yPos,
              size: fontSize,
              font,
              color,
            });
            
            yPos = drawWrappedText(
              page,
              bulletMatch[1],
              x + 35,
              yPos,
              maxWidth - 35,
              fontSize,
              font,
              color,
              1.4
            );
            yPos -= 5;
          }
        }
        // Regular paragraph
        else {
          yPos = drawWrappedText(
            page,
            trimmedLine,
            x,
            yPos,
            maxWidth,
            fontSize,
            font,
            color,
            1.5
          );
          yPos -= 10; // Paragraph spacing
        }
      }
      
      return yPos;
    }
    
    // Title Page
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const contentWidth = width - 100;
    
    // Title
    page.drawText('AI Opportunities Report', {
      x: width / 2 - helveticaBold.widthOfTextAtSize('AI Opportunities Report', 32) / 2,
      y: height - 120,
      size: 32,
      font: helveticaBold,
      color: brandTeal,
    });
    
    // Company Name
    const companyText = companyName || 'Your Company';
    page.drawText(companyText, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(companyText, 24) / 2,
      y: height - 170,
      size: 24,
      font: helveticaBold,
      color: titleGray,
    });
    
    // Prepared for
    if (firstName) {
      const preparedText = `Prepared for ${firstName}`;
      page.drawText(preparedText, {
        x: width / 2 - helvetica.widthOfTextAtSize(preparedText, 16) / 2,
        y: height - 210,
        size: 16,
        font: helvetica,
        color: textGray,
      });
    }
    
    // Footer
    const ezwaiText = 'EZWAI - AI Transformation Solutions';
    page.drawText(ezwaiText, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(ezwaiText, 14) / 2,
      y: 150,
      size: 14,
      font: helveticaBold,
      color: brandTeal,
    });
    
    const taglineText = 'Intelligent Automation for Growing Businesses';
    page.drawText(taglineText, {
      x: width / 2 - helvetica.widthOfTextAtSize(taglineText, 12) / 2,
      y: 130,
      size: 12,
      font: helvetica,
      color: textGray,
    });
    
    // Executive Summary
    if (report.executiveSummary) {
      page = pdfDoc.addPage();
      
      page.drawText('Executive Summary', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBold,
        color: brandTeal,
      });
      
      // Draw a line under the title
      page.drawLine({
        start: { x: 50, y: height - 85 },
        end: { x: width - 50, y: height - 85 },
        thickness: 1,
        color: brandTeal,
      });
      
      let yPos = parseAndDrawFormattedText(
        page,
        report.executiveSummary,
        50,
        height - 110,
        contentWidth,
        11,
        helvetica,
        helveticaBold,
        textGray
      );
      
      // Add new page if needed
      if (yPos < 100) {
        page = pdfDoc.addPage();
        yPos = height - 60;
      }
    }
    
    // Quick Wins
    if (report.quickWins && report.quickWins.length > 0) {
      page = pdfDoc.addPage();
      
      page.drawText('Quick Wins', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBold,
        color: brandTeal,
      });
      
      page.drawLine({
        start: { x: 50, y: height - 85 },
        end: { x: width - 50, y: height - 85 },
        thickness: 1,
        color: brandTeal,
      });
      
      let yPos = height - 110;
      
      report.quickWins.forEach((win, index) => {
        // Check if we need a new page
        if (yPos < 200) {
          page = pdfDoc.addPage();
          yPos = height - 60;
        }
        
        // Title with number
        page.drawText(`${index + 1}.`, {
          x: 50,
          y: yPos,
          size: 14,
          font: helveticaBold,
          color: orange,
        });
        
        yPos = drawWrappedText(
          page,
          win.title,
          75,
          yPos,
          contentWidth - 25,
          14,
          helveticaBold,
          orange,
          1.3
        );
        
        yPos -= 5;
        
        // Description
        yPos = parseAndDrawFormattedText(
          page,
          win.description,
          75,
          yPos,
          contentWidth - 25,
          10,
          helvetica,
          helveticaBold,
          textGray
        );
        
        // Metadata
        if (win.timeframe) {
          yPos -= 5;
          page.drawText('Timeframe:', {
            x: 75,
            y: yPos,
            size: 10,
            font: helveticaBold,
            color: brandTeal,
          });
          page.drawText(` ${win.timeframe}`, {
            x: 135,
            y: yPos,
            size: 10,
            font: helvetica,
            color: textGray,
          });
          yPos -= 15;
        }
        
        if (win.impact) {
          page.drawText('Impact:', {
            x: 75,
            y: yPos,
            size: 10,
            font: helveticaBold,
            color: brandTeal,
          });
          page.drawText(` ${win.impact}`, {
            x: 120,
            y: yPos,
            size: 10,
            font: helvetica,
            color: textGray,
          });
          yPos -= 15;
        }
        
        yPos -= 20; // Space between items
      });
    }
    
    // Strategic Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      page = pdfDoc.addPage();
      
      page.drawText('Strategic Recommendations', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBold,
        color: brandTeal,
      });
      
      page.drawLine({
        start: { x: 50, y: height - 85 },
        end: { x: width - 50, y: height - 85 },
        thickness: 1,
        color: brandTeal,
      });
      
      let yPos = height - 110;
      
      report.recommendations.forEach((rec, index) => {
        // Check if we need a new page
        if (yPos < 200) {
          page = pdfDoc.addPage();
          yPos = height - 60;
        }
        
        // Title with number
        page.drawText(`${index + 1}.`, {
          x: 50,
          y: yPos,
          size: 14,
          font: helveticaBold,
          color: titleGray,
        });
        
        yPos = drawWrappedText(
          page,
          rec.title,
          75,
          yPos,
          contentWidth - 25,
          14,
          helveticaBold,
          titleGray,
          1.3
        );
        
        yPos -= 5;
        
        // Description
        yPos = parseAndDrawFormattedText(
          page,
          rec.description,
          75,
          yPos,
          contentWidth - 25,
          10,
          helvetica,
          helveticaBold,
          textGray
        );
        
        // ROI
        if (rec.roi) {
          yPos -= 5;
          page.drawText('Expected ROI:', {
            x: 75,
            y: yPos,
            size: 10,
            font: helveticaBold,
            color: orange,
          });
          page.drawText(` ${rec.roi}`, {
            x: 155,
            y: yPos,
            size: 10,
            font: helvetica,
            color: textGray,
          });
          yPos -= 15;
        }
        
        yPos -= 20; // Space between items
      });
    }
    
    // Competitive Analysis
    if (report.competitiveAnalysis) {
      page = pdfDoc.addPage();
      
      page.drawText('Competitive Analysis', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBold,
        color: brandTeal,
      });
      
      page.drawLine({
        start: { x: 50, y: height - 85 },
        end: { x: width - 50, y: height - 85 },
        thickness: 1,
        color: brandTeal,
      });
      
      parseAndDrawFormattedText(
        page,
        report.competitiveAnalysis,
        50,
        height - 110,
        contentWidth,
        11,
        helvetica,
        helveticaBold,
        textGray
      );
    }
    
    // Next Steps
    if (report.nextSteps && report.nextSteps.length > 0) {
      page = pdfDoc.addPage();
      
      page.drawText('Next Steps', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBold,
        color: brandTeal,
      });
      
      page.drawLine({
        start: { x: 50, y: height - 85 },
        end: { x: width - 50, y: height - 85 },
        thickness: 1,
        color: brandTeal,
      });
      
      let yPos = height - 110;
      
      // Check if nextSteps is a single string with embedded list
      const stepsText = Array.isArray(report.nextSteps) 
        ? report.nextSteps.join('\n')
        : report.nextSteps;
      
      if (typeof stepsText === 'string' && stepsText.includes(':')) {
        // Parse as formatted text with potential embedded list
        parseAndDrawFormattedText(
          page,
          stepsText,
          50,
          yPos,
          contentWidth,
          12,
          helvetica,
          helveticaBold,
          textGray
        );
      } else if (Array.isArray(report.nextSteps)) {
        // Draw as numbered list
        report.nextSteps.forEach((step, index) => {
          if (yPos < 150) {
            page = pdfDoc.addPage();
            yPos = height - 60;
          }
          
          page.drawText(`${index + 1}.`, {
            x: 50,
            y: yPos,
            size: 12,
            font: helveticaBold,
            color: darkGray,
          });
          
          yPos = drawWrappedText(
            page,
            step,
            75,
            yPos,
            contentWidth - 25,
            12,
            helvetica,
            textGray,
            1.5
          );
          
          yPos -= 10;
        });
      }
    }
    
    // Final CTA page
    page = pdfDoc.addPage();
    
    const ctaTitle = 'Ready to Transform Your Business?';
    page.drawText(ctaTitle, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(ctaTitle, 24) / 2,
      y: height / 2 + 50,
      size: 24,
      font: helveticaBold,
      color: orange,
    });
    
    const ctaSubtitle = 'Schedule your free AI Strategy Session today';
    page.drawText(ctaSubtitle, {
      x: width / 2 - helvetica.widthOfTextAtSize(ctaSubtitle, 16) / 2,
      y: height / 2,
      size: 16,
      font: helvetica,
      color: textGray,
    });
    
    const ctaUrl = 'Visit: ezwai.com/scheduling-calendar/';
    page.drawText(ctaUrl, {
      x: width / 2 - helvetica.widthOfTextAtSize(ctaUrl, 14) / 2,
      y: height / 2 - 50,
      size: 14,
      font: helvetica,
      color: brandTeal,
    });
    
    const ctaContact = 'Email: joe@ezwai.com | Phone: 888-503-9924';
    page.drawText(ctaContact, {
      x: width / 2 - helvetica.widthOfTextAtSize(ctaContact, 12) / 2,
      y: height / 2 - 80,
      size: 12,
      font: helvetica,
      color: textGray,
    });
    
    const copyright = '© 2025 EZWAI - AI Transformation Solutions';
    page.drawText(copyright, {
      x: width / 2 - helvetica.widthOfTextAtSize(copyright, 10) / 2,
      y: 100,
      size: 10,
      font: helvetica,
      color: textGray,
    });
    
    const confidential = 'This report is confidential and proprietary';
    page.drawText(confidential, {
      x: width / 2 - helvetica.widthOfTextAtSize(confidential, 10) / 2,
      y: 80,
      size: 10,
      font: helvetica,
      color: textGray,
    });
    
    // Save the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}