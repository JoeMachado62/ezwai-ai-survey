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
    
    // Load standard fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Title Page
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Title
    page.drawText('AI Opportunities Report', {
      x: 50,
      y: height - 100,
      size: 32,
      font: helveticaBold,
      color: brandTeal,
    });
    
    // Company Name
    page.drawText(companyName || 'Your Company', {
      x: 50,
      y: height - 150,
      size: 24,
      font: helveticaBold,
      color: titleGray,
    });
    
    // Prepared for
    if (firstName) {
      page.drawText(`Prepared for ${firstName}`, {
        x: 50,
        y: height - 190,
        size: 16,
        font: helvetica,
        color: textGray,
      });
    }
    
    // Footer
    page.drawText('EZWAI - AI Transformation Solutions', {
      x: 50,
      y: 150,
      size: 14,
      font: helveticaBold,
      color: brandTeal,
    });
    
    page.drawText('Intelligent Automation for Growing Businesses', {
      x: 50,
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
      
      // Wrap text manually (simple implementation)
      const words = report.executiveSummary.split(' ');
      let line = '';
      let yPos = height - 100;
      const maxWidth = width - 100;
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const testWidth = helvetica.widthOfTextAtSize(testLine, 11);
        
        if (testWidth > maxWidth && line) {
          page.drawText(line, {
            x: 50,
            y: yPos,
            size: 11,
            font: helvetica,
            color: textGray,
          });
          line = word;
          yPos -= 18;
          
          // Add new page if needed
          if (yPos < 100) {
            page = pdfDoc.addPage();
            yPos = height - 60;
          }
        } else {
          line = testLine;
        }
      }
      
      if (line) {
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: 11,
          font: helvetica,
          color: textGray,
        });
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
      
      let yPos = height - 100;
      
      report.quickWins.forEach((win, index) => {
        // Title
        page.drawText(`${index + 1}. ${win.title}`, {
          x: 50,
          y: yPos,
          size: 14,
          font: helveticaBold,
          color: orange,
        });
        yPos -= 25;
        
        // Description (simplified - just first 100 chars)
        const desc = win.description.substring(0, 100) + (win.description.length > 100 ? '...' : '');
        page.drawText(desc, {
          x: 70,
          y: yPos,
          size: 10,
          font: helvetica,
          color: textGray,
        });
        yPos -= 20;
        
        // Timeframe and Impact
        if (win.timeframe) {
          page.drawText(`Timeframe: ${win.timeframe}`, {
            x: 70,
            y: yPos,
            size: 10,
            font: helvetica,
            color: brandTeal,
          });
          yPos -= 15;
        }
        
        if (win.impact) {
          page.drawText(`Impact: ${win.impact}`, {
            x: 70,
            y: yPos,
            size: 10,
            font: helvetica,
            color: brandTeal,
          });
          yPos -= 15;
        }
        
        yPos -= 20;
        
        // Add new page if needed
        if (yPos < 150 && index < report.quickWins.length - 1) {
          page = pdfDoc.addPage();
          yPos = height - 60;
        }
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
      
      let yPos = height - 100;
      
      report.recommendations.forEach((rec, index) => {
        // Title
        page.drawText(`${index + 1}. ${rec.title}`, {
          x: 50,
          y: yPos,
          size: 14,
          font: helveticaBold,
          color: titleGray,
        });
        yPos -= 25;
        
        // Description (simplified)
        const desc = rec.description.substring(0, 100) + (rec.description.length > 100 ? '...' : '');
        page.drawText(desc, {
          x: 70,
          y: yPos,
          size: 10,
          font: helvetica,
          color: textGray,
        });
        yPos -= 20;
        
        // ROI
        if (rec.roi) {
          page.drawText(`Expected ROI: ${rec.roi}`, {
            x: 70,
            y: yPos,
            size: 10,
            font: helvetica,
            color: orange,
          });
          yPos -= 15;
        }
        
        yPos -= 20;
        
        // Add new page if needed
        if (yPos < 150 && index < report.recommendations.length - 1) {
          page = pdfDoc.addPage();
          yPos = height - 60;
        }
      });
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
      
      let yPos = height - 100;
      
      report.nextSteps.forEach((step, index) => {
        page.drawText(`${index + 1}. ${step}`, {
          x: 50,
          y: yPos,
          size: 12,
          font: helvetica,
          color: textGray,
        });
        yPos -= 25;
        
        // Add new page if needed
        if (yPos < 100 && index < report.nextSteps.length - 1) {
          page = pdfDoc.addPage();
          yPos = height - 60;
        }
      });
    }
    
    // Final CTA page
    page = pdfDoc.addPage();
    
    page.drawText('Ready to Transform Your Business?', {
      x: 50,
      y: height / 2 + 50,
      size: 24,
      font: helveticaBold,
      color: orange,
    });
    
    page.drawText('Schedule your free AI Strategy Session today', {
      x: 50,
      y: height / 2,
      size: 16,
      font: helvetica,
      color: textGray,
    });
    
    page.drawText('Visit: ezwai.com/scheduling-calendar/', {
      x: 50,
      y: height / 2 - 50,
      size: 14,
      font: helvetica,
      color: brandTeal,
    });
    
    page.drawText('Email: joe@ezwai.com | Phone: 888-503-9924', {
      x: 50,
      y: height / 2 - 80,
      size: 12,
      font: helvetica,
      color: textGray,
    });
    
    page.drawText('© 2025 EZWAI - AI Transformation Solutions', {
      x: 50,
      y: 100,
      size: 10,
      font: helvetica,
      color: textGray,
    });
    
    page.drawText('This report is confidential and proprietary', {
      x: 50,
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