import PDFDocument from 'pdfkit';
import { ReportResult } from './schemas';

export async function generateReportPdf(
  report: ReportResult,
  companyName: string,
  firstName?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const brandTeal = '#08b2c6';
      const textGray = '#4a5568';
      const titleGray = '#1a202c';

      // Title Page
      doc.fontSize(28)
         .fillColor(brandTeal)
         .text('AI Opportunities Report', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(20)
         .fillColor(titleGray)
         .text(companyName, { align: 'center' });
      
      if (firstName) {
        doc.moveDown();
        doc.fontSize(14)
           .fillColor(textGray)
           .text(`Prepared for ${firstName}`, { align: 'center' });
      }
      
      doc.moveDown(2);

      // Executive Summary
      if (report.executiveSummary) {
        doc.addPage();
        doc.fontSize(22)
           .fillColor(brandTeal)
           .text('Executive Summary', { underline: true });
        
        doc.moveDown();
        doc.fontSize(12)
           .fillColor(textGray)
           .text(report.executiveSummary, {
             align: 'justify',
             lineGap: 5
           });
      }

      // Quick Wins
      if (report.quickWins && report.quickWins.length > 0) {
        doc.addPage();
        doc.fontSize(22)
           .fillColor(brandTeal)
           .text('Quick Wins', { underline: true });
        
        doc.moveDown();
        
        report.quickWins.forEach((win, index) => {
          doc.fontSize(14)
             .fillColor(titleGray)
             .text(`${index + 1}. ${win.title}`, { underline: false });
          
          doc.moveDown(0.5);
          doc.fontSize(11)
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
          
          doc.moveDown();
        });
      }

      // Strategic Recommendations
      if (report.recommendations && report.recommendations.length > 0) {
        doc.addPage();
        doc.fontSize(22)
           .fillColor(brandTeal)
           .text('Strategic Recommendations', { underline: true });
        
        doc.moveDown();
        
        report.recommendations.forEach((rec, index) => {
          doc.fontSize(14)
             .fillColor(titleGray)
             .text(`${index + 1}. ${rec.title}`);
          
          doc.moveDown(0.5);
          doc.fontSize(11)
             .fillColor(textGray)
             .text(rec.description, { 
               align: 'justify',
               indent: 20 
             });
          
          if (rec.roi) {
            doc.moveDown(0.5);
            doc.fontSize(10)
               .fillColor(brandTeal)
               .text(`Expected ROI: ${rec.roi}`, { indent: 20 });
          }
          
          doc.moveDown();
        });
      }

      // Competitive Analysis
      if (report.competitiveAnalysis) {
        doc.addPage();
        doc.fontSize(22)
           .fillColor(brandTeal)
           .text('Competitive Analysis', { underline: true });
        
        doc.moveDown();
        doc.fontSize(12)
           .fillColor(textGray)
           .text(report.competitiveAnalysis, {
             align: 'justify',
             lineGap: 5
           });
      }

      // Next Steps
      if (report.nextSteps && report.nextSteps.length > 0) {
        doc.addPage();
        doc.fontSize(22)
           .fillColor(brandTeal)
           .text('Next Steps', { underline: true });
        
        doc.moveDown();
        
        report.nextSteps.forEach((step, index) => {
          doc.fontSize(12)
             .fillColor(textGray)
             .text(`${index + 1}. ${step}`, {
               align: 'left',
               lineGap: 3
             });
          doc.moveDown(0.5);
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10)
         .fillColor(textGray)
         .text('© 2025 EZWAI - AI Transformation Solutions', { align: 'center' });
      
      doc.fontSize(10)
         .fillColor(brandTeal)
         .text('https://ezwai.com', { 
           align: 'center',
           link: 'https://ezwai.com'
         });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}