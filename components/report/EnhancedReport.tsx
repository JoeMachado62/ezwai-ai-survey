import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ReportSection } from '@/lib/report-types';

interface EnhancedReportProps {
  sections: ReportSection[];
  onClose: () => void;
  businessName: string;
  onReportReady?: (pdfBase64: string) => void;
}

const ReportHeader: React.FC<{ number: string; title: string; imageUrl: string }> = ({ number, title, imageUrl }) => (
  <div className="report-header h-[400px] bg-cover bg-center flex items-end text-white p-8 md:p-12 relative print:h-[300px]" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%), url('${imageUrl}')` }}>
    <h2 className="font-serif text-5xl md:text-6xl font-bold z-10 print:text-4xl">
      <span className="text-brand-orange">{number}.</span> {title}
    </h2>
  </div>
);

const PullQuote: React.FC<{ quote: string }> = ({ quote }) => (
    <blockquote className="keep-together font-serif text-2xl text-brand-orange border-l-4 border-brand-teal pl-6 my-8 italic">
        &ldquo;{quote}&rdquo;
    </blockquote>
);

const StatHighlight: React.FC<{ value: string; description: string }> = ({ value, description }) => (
    <div className="keep-together bg-teal-50 border border-brand-teal p-6 rounded-lg text-center my-6">
        <div className="text-5xl font-bold text-brand-teal leading-none">{value}</div>
        <div className="text-base text-gray-700 mt-2">{description}</div>
    </div>
);

const KeyTakeaways: React.FC<{ items: string[] }> = ({ items }) => (
    <div className="keep-together bg-gray-50 p-6 rounded-lg border-t-4 border-brand-orange">
        <h3 className="font-serif text-xl font-bold text-brand-orange mb-4 border-b-2 border-gray-200 pb-2">Key Takeaways</h3>
        <ul className="list-none space-y-3">
            {items.map((item, index) => (
                <li key={index} className="flex items-start">
                    <span className="text-brand-orange font-bold text-xl mr-3 mt-[-2px]">✓</span>
                    <span className="text-gray-700">{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

// Global cleaning function to use everywhere
const cleanCitations = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove all star-based citations and their variations
    .replace(/cite[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*[a-z0-9_-]*(?:turn\d+|search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/\bturn\d+(?:search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]+/g, '') // Remove any standalone stars
    .replace(/\bcite[^.\s,;!?]*\*/gi, '')
    .replace(/\[\d+\]/g, '') // Remove numbered references
    .replace(/〔[\d:]+－source〕/g, '') // Remove Unicode citation markers
    .replace(/\s*\*+\s*/g, ' ') // Remove standalone asterisks
    .replace(/\s*\.\s*\*/g, '.') // Clean up asterisks after periods
    .replace(/\s+([.,!?;:])/g, '$1') // Fix spacing before punctuation
    .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1') // Remove duplicate punctuation
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .replace(/^\s*[•·]\s*/gm, '• ') // Standardize bullet points
    .trim();
};

const DynamicContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Apply aggressive cleaning first
  const cleanedContent = cleanCitations(content);
  
  // Split into paragraphs more intelligently
  const lines = cleanedContent.split(/\n+/);
  const processedParagraphs: { type: 'heading' | 'bullet' | 'numbered' | 'paragraph' | 'quote'; content: string }[] = [];
  let currentParagraph = '';
  let inList = false;
  
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      if (currentParagraph) {
        processedParagraphs.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = '';
      }
      inList = false;
      return;
    }
    
    // Check for headers (lines that start and end with **)
    if (trimmedLine.startsWith('**') && trimmedLine.includes('**')) {
      if (currentParagraph) {
        processedParagraphs.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = '';
      }
      processedParagraphs.push({ type: 'heading', content: trimmedLine });
      inList = false;
      return;
    }
    
    // Check for bullet points
    if (/^[-•*]\s+/.test(trimmedLine)) {
      if (currentParagraph && !inList) {
        processedParagraphs.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = '';
      }
      processedParagraphs.push({ type: 'bullet', content: trimmedLine.replace(/^[-•*]\s+/, '') });
      inList = true;
      return;
    }
    
    // Check for numbered lists
    if (/^\d+\.\s+/.test(trimmedLine)) {
      if (currentParagraph && !inList) {
        processedParagraphs.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = '';
      }
      const number = trimmedLine.match(/^(\d+)\./)?.[1] || '1';
      processedParagraphs.push({ 
        type: 'numbered', 
        content: number + '.' + trimmedLine.replace(/^\d+\.\s*/, '')
      });
      inList = true;
      return;
    }
    
    // Check for short impactful quotes
    if (trimmedLine.length < 120 && trimmedLine.length > 20 && !inList) {
      if (currentParagraph) {
        processedParagraphs.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = '';
      }
      processedParagraphs.push({ type: 'quote', content: trimmedLine });
      return;
    }
    
    // Regular paragraph text
    if (inList) {
      processedParagraphs.push({ type: 'paragraph', content: trimmedLine });
      inList = false;
    } else {
      currentParagraph = currentParagraph ? `${currentParagraph} ${trimmedLine}` : trimmedLine;
    }
  });
  
  // Don't forget the last paragraph
  if (currentParagraph) {
    processedParagraphs.push({ type: 'paragraph', content: currentParagraph });
  }
  
  const statRegex = /(\d+%|\$\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b\d+x\b|by \d+%|over \d+%|an \d+% increase)/gi;
  
  const highlightStats = (text: string) => {
    const parts = text.split(statRegex);
    return parts.map((part, i) => {
      const cleanPart = cleanCitations(part);
      if (cleanPart.match(statRegex)) {
        return (
          <span key={i} className="font-bold text-brand-teal bg-teal-50 px-2 py-1 rounded-md mx-1 inline-block">
            {cleanPart}
          </span>
        );
      }
      // Handle bold markdown
      const processedPart = cleanPart.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
      if (processedPart !== cleanPart) {
        return <span key={i} dangerouslySetInnerHTML={{ __html: processedPart }} />;
      }
      return cleanPart;
    });
  };

  return (
    <div className="space-y-4">
      {processedParagraphs.map((item, index) => {
        const cleanContent = cleanCitations(item.content);
        
        switch (item.type) {
          case 'heading':
            const titleMatch = cleanContent.match(/\*\*(.*?)\*\*/);
            const title = titleMatch ? titleMatch[1] : cleanContent.replace(/\*/g, '');
            const rest = cleanContent.replace(/\*\*(.*?)\*\*/, '').trim();
            return (
              <div key={index} className="keep-together mb-6 border-l-4 border-brand-teal pl-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{cleanCitations(title)}</h3>
                {rest && (
                  <p className="text-gray-700 leading-relaxed text-lg">{highlightStats(rest)}</p>
                )}
              </div>
            );
            
          case 'bullet':
            return (
              <div key={index} className="flex items-start mb-3 ml-4">
                <span className="text-brand-teal mr-3 text-xl mt-1">•</span>
                <p className="text-gray-700 leading-relaxed flex-1 text-lg">
                  {highlightStats(cleanContent)}
                </p>
              </div>
            );
            
          case 'numbered':
            const [num, ...textParts] = cleanContent.split('.');
            const text = textParts.join('.').trim();
            return (
              <div key={index} className="flex items-start mb-3 ml-4">
                <span className="text-brand-teal font-bold mr-4 text-lg min-w-[24px]">{num}.</span>
                <p className="text-gray-700 leading-relaxed flex-1 text-lg">
                  {highlightStats(text)}
                </p>
              </div>
            );
            
          case 'quote':
            return (
              <p key={index} className="keep-together text-xl font-serif text-gray-600 my-8 italic text-center leading-relaxed px-8 border-t border-b border-gray-200 py-4">
                {cleanCitations(cleanContent)}
              </p>
            );
            
          default:
            return (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed text-lg">
                {highlightStats(cleanContent)}
              </p>
            );
        }
      })}
    </div>
  );
};

const EnhancedReport: React.FC<EnhancedReportProps> = ({ sections, onClose, businessName, onReportReady }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [pdfGenerated, setPdfGenerated] = React.useState(false);

  // Add print styles to prevent page breaks
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .keep-together {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .report-section {
          page-break-inside: auto;
        }
        .report-header {
          page-break-before: always;
        }
      }
      @page {
        margin: 0;
        size: A4;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const generatePdfBase64 = async (): Promise<string> => {
    const reportElement = reportRef.current;
    if (!reportElement) return '';

    // Save original styles
    const originalWidth = reportElement.style.width;
    const originalPosition = reportElement.style.position;
    
    // Set up for capture
    reportElement.style.width = '794px'; // A4 width in pixels at 96dpi
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    
    // Wait for reflow
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Clean up cloned document
          const clonedElement = clonedDoc.getElementById(reportElement.id || 'report');
          if (clonedElement) {
            clonedElement.style.width = '794px';
          }
        }
      });
      
      // Restore original styles
      reportElement.style.width = originalWidth;
      reportElement.style.position = originalPosition;
      reportElement.style.left = '';

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      
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
      
      return pdf.output('datauristring').split(',')[1];
    } catch (error) {
      console.error('PDF generation error:', error);
      // Restore styles on error
      reportElement.style.width = originalWidth;
      reportElement.style.position = originalPosition;
      reportElement.style.left = '';
      return '';
    }
  };
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const base64 = await generatePdfBase64();
      
      if (!base64) {
        console.error('Failed to generate PDF');
        setIsDownloading(false);
        return;
      }
      
      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${businessName.replace(/\s+/g, '_')}_AI_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Generate PDF and notify parent when report is ready
  React.useEffect(() => {
    if (!pdfGenerated && onReportReady) {
      const timer = setTimeout(async () => {
        try {
          const pdfBase64 = await generatePdfBase64();
          if (pdfBase64) {
            onReportReady(pdfBase64);
            setPdfGenerated(true);
          }
        } catch (error) {
          console.error('Failed to generate PDF for email:', error);
        }
      }, 3000); // Give more time for full render
      
      return () => clearTimeout(timer);
    }
  }, [pdfGenerated, onReportReady]);
  
  return (
    <div className="bg-gray-200 py-8 font-sans">
      <div className="max-w-4xl mx-auto p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50 bg-gray-200/80 backdrop-blur-sm rounded-b-lg mb-8">
        <h1 className="font-serif text-2xl font-bold text-center sm:text-left text-gray-800">Your Enhanced AI Report</h1>
        <div className="flex gap-4">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-6 py-2 bg-brand-teal text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
          >
            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-orange text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
      
      <div ref={reportRef} id="report" className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden">
        <header className="report-header h-[100vh] bg-cover bg-center flex flex-col justify-center items-center text-white text-center p-8" 
                style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/682e45448e62615ab032eb08.webp')"}}>
          <h1 className="font-serif text-6xl md:text-7xl font-bold text-shadow-lg">AI Strategic Brief</h1>
          <p className="font-sans text-2xl mt-4 max-w-2xl text-shadow">A Growth & Innovation Roadmap for</p>
          <p className="font-serif text-4xl mt-2 text-brand-orange font-bold text-shadow">{businessName}</p>
        </header>

        <main>
          {sections.map((section, index) => (
            <section key={index} className="report-section bg-white border-b-2 border-gray-100">
              {section.imageUrl && (
                <ReportHeader number={(index + 1).toString().padStart(2, '0')} title={section.title} imageUrl={section.imageUrl} />
              )}
              <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 text-lg text-gray-800 space-y-6 leading-relaxed">
                  <DynamicContentRenderer content={section.mainContent} />
                  {section.pullQuote && <PullQuote quote={section.pullQuote} />}
                </div>
                <aside className="lg:col-span-1 space-y-6">
                  {section.statistic && <StatHighlight value={section.statistic.value} description={section.statistic.description}/>}
                  {section.keyTakeaways && section.keyTakeaways.length > 0 && (
                    <KeyTakeaways items={section.keyTakeaways} />
                  )}
                </aside>
              </div>
            </section>
          ))}
        </main>

        <footer className="bg-gray-800 text-white p-12 text-center">
          <div className="font-serif text-2xl text-brand-teal">EZWAI Consulting</div>
          <p className="text-brand-orange mt-1">Intelligent Automation for Growing Businesses</p>
          <div className="mt-6 text-xs text-gray-400 max-w-2xl mx-auto">
            This report was generated using proprietary AI analysis and creative direction. The information and recommendations contained herein are for strategic planning purposes and do not constitute financial or legal advice.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EnhancedReport;