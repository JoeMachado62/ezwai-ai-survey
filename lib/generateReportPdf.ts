import { ReportResult } from './schemas';

// Create a minimal PDF without any external dependencies
export async function generateReportPdf(
  report: ReportResult,
  companyName: string,
  firstName?: string
): Promise<Buffer> {
  // Use a try-catch to handle the dynamic import
  let PDFDocument: any;
  try {
    PDFDocument = require('pdfkit');
  } catch (e) {
    // If require fails (in some environments), try dynamic import
    const pdfkitModule = await import('pdfkit');
    PDFDocument = pdfkitModule.default || pdfkitModule;
  }

  return new Promise((resolve, reject) => {
    try {
      // Create a basic PDF with minimal configuration
      // Avoid any font file system operations by using defaults
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        autoFirstPage: true // Let PDFKit handle page creation normally
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Define colors
      const brandTeal = '#08b2c6';
      const textGray = '#4a5568';
      const titleGray = '#1a202c';
      const orange = '#ff6b11';

      // Title Page - use default font without explicitly setting it
      doc.fontSize(32)
         .fillColor(brandTeal)
         .text('AI Opportunities Report', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(24)
         .fillColor(titleGray)
         .text(companyName || 'Your Company', { align: 'center' });
      
      if (firstName) {
        doc.moveDown();
        doc.fontSize(16)
           .fillColor(textGray)
           .text(`Prepared for ${firstName}`, { align: 'center' });
      }

      doc.moveDown(3);
      doc.fontSize(14)
         .fillColor(brandTeal)
         .text('EZWAI - AI Transformation Solutions', { align: 'center' });
      
      doc.fontSize(12)
         .fillColor(textGray)
         .text('Intelligent Automation for Growing Businesses', { align: 'center' });

      // Executive Summary
      if (report.executiveSummary) {
        doc.addPage();
        doc.fontSize(24)
           .fillColor(brandTeal)
           .text('Executive Summary');
        
        doc.moveDown();
        doc.fontSize(11)
           .fillColor(textGray)
           .text(report.executiveSummary, {
             align: 'justify',
             lineGap: 5
           });
      }

      // Quick Wins
      if (report.quickWins && report.quickWins.length > 0) {
        doc.addPage();
        doc.fontSize(24)
           .fillColor(brandTeal)
           .text('Quick Wins');
        
        doc.moveDown();
        
        report.quickWins.forEach((win, index) => {
          doc.fontSize(14)
             .fillColor(orange)
             .text(`${index + 1}. ${win.title}`);
          
          doc.moveDown(0.5);
          doc.fontSize(10)
             .fillColor(textGray)
             .text(win.description, {
               align: 'justify',
               indent: 20
             });
          
          if (win.timeframe) {
            doc.moveDown(0.5);
            doc.fontSize(10)
               .fillColor(brandTeal)
               .text(`Timeframe: ${win.timeframe}`, { indent: 20 });
          }
          
          if (win.impact) {
            doc.fontSize(10)
               .fillColor(brandTeal)
               .text(`Impact: ${win.impact}`, { indent: 20 });
          }
          
          doc.moveDown(1.5);
        });
      }

      // Strategic Recommendations
      if (report.recommendations && report.recommendations.length > 0) {
        doc.addPage();
        doc.fontSize(24)
           .fillColor(brandTeal)
           .text('Strategic Recommendations');
        
        doc.moveDown();
        
        report.recommendations.forEach((rec, index) => {
          doc.fontSize(14)
             .fillColor(titleGray)
             .text(`${index + 1}. ${rec.title}`);
          
          doc.moveDown(0.5);
          doc.fontSize(10)
             .fillColor(textGray)
             .text(rec.description, {
               align: 'justify',
               indent: 20
             });
          
          if (rec.roi) {
            doc.moveDown(0.5);
            doc.fontSize(10)
               .fillColor(orange)
               .text(`Expected ROI: ${rec.roi}`, { indent: 20 });
          }
          
          doc.moveDown(1.5);
        });
      }

      // Competitive Analysis
      if (report.competitiveAnalysis) {
        doc.addPage();
        doc.fontSize(24)
           .fillColor(brandTeal)
           .text('Competitive Analysis');
        
        doc.moveDown();
        doc.fontSize(11)
           .fillColor(textGray)
           .text(report.competitiveAnalysis, {
             align: 'justify',
             lineGap: 5
           });
      }

      // Next Steps
      if (report.nextSteps && report.nextSteps.length > 0) {
        doc.addPage();
        doc.fontSize(24)
           .fillColor(brandTeal)
           .text('Next Steps');
        
        doc.moveDown();
        
        report.nextSteps.forEach((step, index) => {
          doc.fontSize(12)
             .fillColor(textGray)
             .text(`${index + 1}. ${step}`, {
               lineGap: 8
             });
        });
      }

      // Final CTA page
      doc.addPage();
      doc.moveDown(4);
      doc.fontSize(24)
         .fillColor(orange)
         .text('Ready to Transform Your Business?', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(16)
         .fillColor(textGray)
         .text('Schedule your free AI Strategy Session today', { align: 'center' });
      
      doc.moveDown(2);
      doc.fontSize(14)
         .fillColor(brandTeal)
         .text('Visit: ezwai.com/scheduling-calendar/', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(12)
         .fillColor(textGray)
         .text('Email: joe@ezwai.com | Phone: 888-503-9924', { align: 'center' });
      
      doc.moveDown(4);
      doc.fontSize(10)
         .fillColor(textGray)
         .text('© 2025 EZWAI - AI Transformation Solutions', { align: 'center' });
      doc.text('This report is confidential and proprietary', { align: 'center' });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
}