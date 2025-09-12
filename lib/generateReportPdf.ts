import { ReportResult } from './schemas';

// Simple HTML-based PDF generation without external dependencies
export async function generateReportPdf(
  report: ReportResult,
  companyName: string,
  firstName?: string
): Promise<Buffer> {
  // Create a simple HTML representation of the report
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #08b2c6; border-bottom: 3px solid #08b2c6; padding-bottom: 10px; }
    h2 { color: #08b2c6; margin-top: 30px; }
    h3 { color: #333; margin-top: 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .quick-win { background: #f0f9ff; padding: 15px; margin: 15px 0; border-left: 4px solid #08b2c6; }
    .recommendation { background: #f8fafc; padding: 15px; margin: 15px 0; border-left: 4px solid #ff6b11; }
    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    ul { margin: 10px 0; padding-left: 25px; }
    li { margin: 5px 0; }
    .impact { color: #08b2c6; font-weight: bold; }
    .timeframe { color: #666; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI Opportunities Report</h1>
    <h2>${companyName || 'Your Company'}</h2>
    ${firstName ? `<p>Prepared for ${firstName}</p>` : ''}
  </div>

  ${report.executiveSummary ? `
  <div class="section">
    <h2>Executive Summary</h2>
    <p>${report.executiveSummary.replace(/\n/g, '<br>')}</p>
  </div>
  ` : ''}

  ${report.quickWins && report.quickWins.length > 0 ? `
  <div class="section">
    <h2>Quick Wins</h2>
    ${report.quickWins.map((win, index) => `
      <div class="quick-win">
        <h3>${index + 1}. ${win.title}</h3>
        <p>${win.description}</p>
        ${win.timeframe ? `<p class="timeframe">Timeframe: ${win.timeframe}</p>` : ''}
        ${win.impact ? `<p class="impact">Impact: ${win.impact}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${report.recommendations && report.recommendations.length > 0 ? `
  <div class="section">
    <h2>Strategic Recommendations</h2>
    ${report.recommendations.map((rec, index) => `
      <div class="recommendation">
        <h3>${index + 1}. ${rec.title}</h3>
        <p>${rec.description}</p>
        ${rec.roi ? `<p class="impact">Expected ROI: ${rec.roi}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${report.competitiveAnalysis ? `
  <div class="section">
    <h2>Competitive Analysis</h2>
    <p>${report.competitiveAnalysis.replace(/\n/g, '<br>')}</p>
  </div>
  ` : ''}

  ${report.nextSteps && report.nextSteps.length > 0 ? `
  <div class="section">
    <h2>Next Steps</h2>
    <ul>
      ${report.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>© 2025 EZWAI - AI Transformation Solutions</p>
    <p>https://ezwai.com</p>
  </div>
</body>
</html>
  `;

  // For now, return the HTML as a buffer
  // In production, you might want to use a service like Puppeteer or a PDF API
  // But this avoids the font file issues entirely
  const buffer = Buffer.from(html, 'utf-8');
  
  // Return a simple text representation as PDF placeholder
  // This ensures email attachment works without font dependencies
  return buffer;
}