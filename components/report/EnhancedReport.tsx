
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ReportSection } from '@/lib/report-types';

interface EnhancedReportProps {
  sections: ReportSection[];
  onClose: () => void;
  businessName: string;
}

const ReportHeader: React.FC<{ number: string; title: string; imageUrl: string }> = ({ number, title, imageUrl }) => (
  <div className="h-[400px] bg-cover bg-center flex items-end text-white p-8 md:p-12 relative print:h-[300px]" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%), url('${imageUrl}')` }}>
    <h2 className="font-serif text-5xl md:text-6xl font-bold z-10 print:text-4xl">
      <span className="text-brand-orange">{number}.</span> {title}
    </h2>
  </div>
);

const PullQuote: React.FC<{ quote: string }> = ({ quote }) => (
    <blockquote className="font-serif text-2xl text-brand-orange border-l-4 border-brand-teal pl-6 my-8 italic">
        &ldquo;{quote}&rdquo;
    </blockquote>
);

const StatHighlight: React.FC<{ value: string; description: string }> = ({ value, description }) => (
    <div className="bg-teal-50 border border-brand-teal p-6 rounded-lg text-center my-6">
        <div className="text-5xl font-bold text-brand-teal leading-none">{value}</div>
        <div className="text-base text-gray-700 mt-2">{description}</div>
    </div>
);

const KeyTakeaways: React.FC<{ items: string[] }> = ({ items }) => (
    <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-brand-orange">
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

/**
 * A component to render text content dynamically, highlighting stats
 * and styling impactful paragraphs to create a magazine-like feel.
 */
const DynamicContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  // Regex to find stats, percentages, monetary values, etc.
  const statRegex = /(\d+%|\$\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b\d+x\b|by \d+%|over \d+%|an \d+% increase)/gi;
  
  // Regex to detect markdown bold sections
  const boldRegex = /\*\*(.*?)\*\*/g;

  return (
    <>
      {paragraphs.map((paragraph, pIndex) => {
        // Check if this looks like a section title (starts with ** and ends with **)
        if (paragraph.startsWith('**') && paragraph.includes('**')) {
          const titleMatch = paragraph.match(/\*\*(.*?)\*\*/);
          const title = titleMatch ? titleMatch[1] : paragraph;
          const rest = paragraph.replace(/\*\*(.*?)\*\*/, '').trim();
          
          return (
            <div key={pIndex} className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              {rest && <p className="text-gray-700">{rest}</p>}
            </div>
          );
        }
        
        // Heuristic for an "impactful paragraph" that acts like a mini pull-quote.
        if (paragraph.length < 150 && paragraphs.length > 1) {
          return (
            <p key={pIndex} className="text-xl font-serif text-gray-600 my-6 italic text-center leading-relaxed">
              {paragraph}
            </p>
          );
        }

        const parts = paragraph.split(statRegex);

        return (
          <p key={pIndex} className="mb-4">
            {parts.map((part, i) => {
              if (part.match(statRegex)) {
                return (
                  <span key={i} className="font-bold text-brand-teal bg-teal-50 px-2 py-1 rounded-md mx-1 whitespace-nowrap">
                    {part}
                  </span>
                );
              }
              // Process bold markdown in regular text
              const processedPart = part.replace(boldRegex, '<strong>$1</strong>');
              if (processedPart !== part) {
                return <span key={i} dangerouslySetInnerHTML={{ __html: processedPart }} />;
              }
              return part;
            })}
          </p>
        );
      })}
    </>
  );
};


const EnhancedReport: React.FC<EnhancedReportProps> = ({ sections, onClose, businessName }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    setIsDownloading(true);

    // Temporarily increase width for higher resolution capture
    const originalWidth = reportElement.style.width;
    reportElement.style.width = '1024px';

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 1024,
    });
    
    // Restore original width
    reportElement.style.width = originalWidth;

    const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for better compression
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
      hotfixes: ['px_scaling'],
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = canvasWidth / pdfWidth;
    const pdfHeight = canvasHeight / ratio;
    const totalPdfPages = Math.ceil(pdfHeight / pdf.internal.pageSize.getHeight());

    for (let i = 0; i < totalPdfPages; i++) {
        if (i > 0) pdf.addPage();
        const yPos = -i * pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, yPos, pdfWidth, pdfHeight, undefined, 'FAST');
    }
    
    pdf.save(`${businessName.replace(/\s+/g, '_')}_AI_Report.pdf`);
    setIsDownloading(false);
  };
  
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
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-brand-orange text-white font-bold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
            >
              Close Report
            </button>
        </div>
      </div>
      
      <div ref={reportRef} className="max-w-4xl mx-auto bg-white shadow-2xl">
        <header className="h-[100vh] bg-cover bg-center flex flex-col justify-center items-center text-white text-center p-8" style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687ac926bb03231da1400a5a.jpeg')"}}>
            <h1 className="font-serif text-6xl md:text-7xl font-bold text-shadow-lg">AI Strategic Brief</h1>
            <p className="font-sans text-2xl mt-4 max-w-2xl text-shadow">A Growth & Innovation Roadmap for</p>
            <p className="font-serif text-4xl mt-2 text-brand-orange font-bold text-shadow">{businessName}</p>
        </header>

        <main>
          {sections.map((section, index) => (
            <section key={index} className="bg-white border-b-2 border-gray-100">
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
                  {section.keyTakeaways && section.keyTakeaways.length > 0 && <KeyTakeaways items={section.keyTakeaways} />}
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
