import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ReportSection } from './report-types';

export async function generateStyledPdfFromSections(sections: ReportSection[], businessName: string): Promise<string> {
  // Create a temporary container for rendering
  const tempContainer = document.createElement('div');
  tempContainer.id = 'temp-pdf-container';
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '794px'; // A4 width at 96dpi
  tempContainer.style.backgroundColor = '#ffffff';
  document.body.appendChild(tempContainer);
  
  // Build the HTML content with proper styling
  tempContainer.innerHTML = `
    <div id="report" style="max-width: 794px; margin: 0 auto; background: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Cover Page -->
      <div style="height: 100vh; background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/682e45448e62615ab032eb08.webp') center/cover; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: white; padding: 40px; page-break-after: always;">
        <h1 style="font-size: 72px; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">AI Strategic Brief</h1>
        <p style="font-size: 24px; margin-bottom: 10px;">A Growth & Innovation Roadmap for</p>
        <p style="font-size: 36px; color: #e1530a; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${businessName}</p>
      </div>
      
      ${sections.map((section, index) => `
        <div style="page-break-before: always; background: white;">
          ${section.imageUrl ? `
            <div style="height: 400px; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%), url('${section.imageUrl}') center/cover; display: flex; align-items: flex-end; padding: 48px; color: white;">
              <h2 style="font-size: 48px; font-weight: bold; margin: 0;">
                <span style="color: #e1530a;">${(index + 1).toString().padStart(2, '0')}.</span> ${section.title}
              </h2>
            </div>
          ` : ''}
          
          <div style="padding: 48px;">
            <div style="font-size: 18px; line-height: 1.8; color: #374151; margin-bottom: 32px;">
              ${section.mainContent
                .replace(/\n\n/g, '</p><p style="margin-bottom: 16px;">')
                .replace(/\n/g, '<br/>')
                .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #111827;">$1</strong>')
                .replace(/(\d+%|\$[\d,]+)/g, '<span style="font-weight: bold; color: #08b2c6; background: rgba(8,178,198,0.1); padding: 2px 6px; border-radius: 4px;">$1</span>')}
            </div>
            
            ${section.pullQuote ? `
              <blockquote style="border-left: 4px solid #e1530a; padding-left: 24px; margin: 32px 0; font-size: 24px; font-style: italic; color: #e1530a;">
                "${section.pullQuote}"
              </blockquote>
            ` : ''}
            
            ${section.statistic ? `
              <div style="background: #f0fdff; border: 1px solid #08b2c6; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0;">
                <div style="font-size: 48px; font-weight: bold; color: #08b2c6;">${section.statistic.value}</div>
                <div style="font-size: 16px; color: #374151; margin-top: 8px;">${section.statistic.description}</div>
              </div>
            ` : ''}
            
            ${section.keyTakeaways && section.keyTakeaways.length > 0 ? `
              <div style="background: #f9fafb; padding: 24px; border-radius: 8px; border-top: 4px solid #e1530a; margin-top: 32px;">
                <h3 style="font-size: 20px; font-weight: bold; color: #e1530a; margin-bottom: 16px;">Key Takeaways</h3>
                <ul style="list-style: none; padding: 0;">
                  ${section.keyTakeaways.map(item => `
                    <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                      <span style="color: #e1530a; font-weight: bold; font-size: 20px; margin-right: 12px;">✓</span>
                      <span style="color: #374151;">${item}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
      
      <!-- Footer -->
      <div style="background: #1f2937; color: white; padding: 48px; text-align: center; page-break-before: always;">
        <div style="font-size: 24px; color: #08b2c6; margin-bottom: 8px;">EZWAI Consulting</div>
        <p style="color: #e1530a;">Intelligent Automation for Growing Businesses</p>
        <div style="margin-top: 24px; font-size: 12px; color: #9ca3af; max-width: 600px; margin-left: auto; margin-right: auto;">
          This report was generated using proprietary AI analysis and creative direction. The information and recommendations contained herein are for strategic planning purposes and do not constitute financial or legal advice.
        </div>
      </div>
    </div>
  `;
  
  // Wait for images to load
  await new Promise(resolve => {
    const images = tempContainer.querySelectorAll('img');
    if (images.length === 0) {
      setTimeout(resolve, 1000);
      return;
    }
    
    let loadedCount = 0;
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= images.length) {
        setTimeout(resolve, 500); // Extra delay for rendering
      }
    };
    
    images.forEach(img => {
      if (img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete;
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(resolve, 5000);
  });
  
  try {
    // Generate canvas from the HTML
    const canvas = await html2canvas(tempContainer.querySelector('#report') as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794,
      backgroundColor: '#ffffff',
      imageTimeout: 10000
    });
    
    // Convert to PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [595, 842], // A4 in points
      compress: true
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    
    let heightLeft = scaledHeight;
    let position = 0;
    
    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, scaledWidth, scaledHeight);
    heightLeft -= pdfHeight;
    
    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - scaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, scaledWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }
    
    // Get base64 string
    const base64 = pdf.output('datauristring').split(',')[1];
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    return base64;
  } catch (error) {
    console.error('Error generating styled PDF:', error);
    // Clean up on error
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
    throw error;
  }
}