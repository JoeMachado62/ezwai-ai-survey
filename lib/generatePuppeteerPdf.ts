import puppeteer from 'puppeteer';
import type { ReportSection } from './report-types';

// Clean citations from text
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/cite[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*[a-z0-9_-]*(?:turn\d+|search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/\bturn\d+(?:search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]+/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export async function generatePuppeteerPdf(sections: ReportSection[], businessName: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for A4 size
    await page.setViewport({ width: 794, height: 1123 });
    
    // Build the HTML content with full styling (magazine-style)
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: white;
          color: #374151;
          line-height: 1.6;
        }
        
        .page {
          page-break-after: always;
          min-height: 100vh;
        }
        
        /* Cover Page */
        .cover-page {
          height: 100vh;
          background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), 
                      url('https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/682e45448e62615ab032eb08.webp') center/cover;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: white;
          padding: 40px;
        }
        
        .cover-title {
          font-size: 72px;
          font-weight: bold;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          font-family: Georgia, serif;
        }
        
        .cover-subtitle {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .cover-company {
          font-size: 36px;
          color: #e1530a;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          font-family: Georgia, serif;
        }
        
        /* Section Pages */
        .section-page {
          background: white;
          min-height: 100vh;
        }
        
        .section-header {
          height: 400px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          padding: 48px;
          color: white;
          position: relative;
        }
        
        .section-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%);
        }
        
        .section-number {
          font-size: 48px;
          font-weight: bold;
          color: #e1530a;
          margin-right: 12px;
          z-index: 1;
          font-family: Georgia, serif;
        }
        
        .section-title {
          font-size: 48px;
          font-weight: bold;
          z-index: 1;
          font-family: Georgia, serif;
        }
        
        .section-content {
          padding: 48px;
        }
        
        .main-content {
          font-size: 18px;
          line-height: 1.8;
          color: #374151;
          margin-bottom: 32px;
        }
        
        .main-content p {
          margin-bottom: 16px;
        }
        
        .main-content strong {
          font-weight: 600;
          color: #111827;
        }
        
        .stat-highlight {
          font-weight: bold;
          color: #08b2c6;
          background: rgba(8,178,198,0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        /* Pull Quote */
        .pull-quote {
          border-left: 4px solid #e1530a;
          padding-left: 24px;
          margin: 32px 0;
          font-size: 24px;
          font-style: italic;
          color: #e1530a;
          font-family: Georgia, serif;
        }
        
        /* Statistics Box */
        .statistic-box {
          background: #f0fdff;
          border: 2px solid #08b2c6;
          padding: 24px;
          border-radius: 8px;
          text-align: center;
          margin: 32px 0;
        }
        
        .statistic-value {
          font-size: 48px;
          font-weight: bold;
          color: #08b2c6;
          line-height: 1;
        }
        
        .statistic-description {
          font-size: 16px;
          color: #374151;
          margin-top: 8px;
        }
        
        /* Key Takeaways */
        .key-takeaways {
          background: #f9fafb;
          padding: 24px;
          border-radius: 8px;
          border-top: 4px solid #e1530a;
          margin-top: 32px;
        }
        
        .key-takeaways-title {
          font-size: 20px;
          font-weight: bold;
          color: #e1530a;
          margin-bottom: 16px;
          font-family: Georgia, serif;
        }
        
        .key-takeaway-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .key-takeaway-bullet {
          color: #e1530a;
          font-weight: bold;
          font-size: 20px;
          margin-right: 12px;
        }
        
        .key-takeaway-text {
          flex: 1;
          color: #374151;
        }
        
        /* Footer */
        .footer-page {
          background: #1f2937;
          color: white;
          padding: 48px;
          text-align: center;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .footer-title {
          font-size: 24px;
          color: #08b2c6;
          margin-bottom: 8px;
          font-family: Georgia, serif;
        }
        
        .footer-subtitle {
          color: #e1530a;
          margin-bottom: 24px;
        }
        
        .footer-disclaimer {
          font-size: 12px;
          color: #9ca3af;
          max-width: 600px;
          line-height: 1.6;
        }
        
        /* Bullet points */
        .bullet-list {
          margin: 16px 0;
        }
        
        .bullet-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .bullet-point {
          color: #08b2c6;
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <!-- Cover Page -->
      <div class="page cover-page">
        <h1 class="cover-title">AI Strategic Brief</h1>
        <p class="cover-subtitle">A Growth & Innovation Roadmap for</p>
        <p class="cover-company">${businessName}</p>
      </div>
      
      ${sections.map((section, index) => `
        <div class="page section-page">
          ${section.imageUrl ? `
            <div class="section-header" style="background-image: url('${section.imageUrl}');">
              <div style="display: flex; align-items: center; z-index: 1;">
                <span class="section-number">${(index + 1).toString().padStart(2, '0')}.</span>
                <h2 class="section-title">${section.title}</h2>
              </div>
            </div>
          ` : ''}
          
          <div class="section-content">
            <div class="main-content">
              ${formatContent(section.mainContent)}
            </div>
            
            ${section.pullQuote ? `
              <div class="pull-quote">
                "${cleanText(section.pullQuote)}"
              </div>
            ` : ''}
            
            ${section.statistic ? `
              <div class="statistic-box">
                <div class="statistic-value">${section.statistic.value}</div>
                <div class="statistic-description">${section.statistic.description}</div>
              </div>
            ` : ''}
            
            ${section.keyTakeaways && section.keyTakeaways.length > 0 ? `
              <div class="key-takeaways">
                <h3 class="key-takeaways-title">Key Takeaways</h3>
                ${section.keyTakeaways.map(item => `
                  <div class="key-takeaway-item">
                    <span class="key-takeaway-bullet">✓</span>
                    <span class="key-takeaway-text">${cleanText(item)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
      
      <!-- Footer Page -->
      <div class="page footer-page">
        <div class="footer-title">EZWAI Consulting</div>
        <p class="footer-subtitle">Intelligent Automation for Growing Businesses</p>
        <p class="footer-disclaimer">
          This report was generated using proprietary AI analysis and creative direction. 
          The information and recommendations contained herein are for strategic planning 
          purposes and do not constitute financial or legal advice.
        </p>
      </div>
    </body>
    </html>
    `;
    
    // Set content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'a4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    return pdfBuffer;
    
  } finally {
    await browser.close();
  }
}

// Helper function to format content
function formatContent(content: string): string {
  const cleaned = cleanText(content);
  
  // Convert markdown-style formatting to HTML
  let html = cleaned
    // Convert double newlines to paragraphs
    .split(/\n\n+/)
    .map(para => {
      // Handle bullet points
      if (para.trim().startsWith('•') || para.trim().startsWith('-')) {
        const items = para.split(/\n/).filter(item => item.trim());
        return `<div class="bullet-list">${items.map(item => 
          `<div class="bullet-item">
            <span class="bullet-point">•</span>
            <span>${cleanText(item.replace(/^[•-]\s*/, ''))}</span>
          </div>`
        ).join('')}</div>`;
      }
      
      // Handle numbered lists
      if (/^\d+\.\s/.test(para.trim())) {
        const items = para.split(/\n/).filter(item => item.trim());
        return `<div class="bullet-list">${items.map(item => {
          const match = item.match(/^(\d+)\.\s*(.*)/);
          if (match) {
            return `<div class="bullet-item">
              <span style="color: #08b2c6; font-weight: bold; margin-right: 8px;">${match[1]}.</span>
              <span>${cleanText(match[2])}</span>
            </div>`;
          }
          return '';
        }).join('')}</div>`;
      }
      
      // Regular paragraph
      return `<p>${para}</p>`;
    })
    .join('');
  
  // Handle bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle statistics/numbers
  html = html.replace(/(\d+%|\$[\d,]+)/g, '<span class="stat-highlight">$1</span>');
  
  return html;
}