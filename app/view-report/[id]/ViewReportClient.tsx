'use client';

import { useState, useEffect } from 'react';
import EnhancedReport from '@/components/report/EnhancedReport';

interface ViewReportClientProps {
  reportData: any;
  reportId: string;
}

export default function ViewReportClient({ reportData, reportId }: ViewReportClientProps) {
  const [showPrintButton, setShowPrintButton] = useState(true);

  // Check if we have an HTML report (new format)
  if (reportData.htmlReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div 
          className="report-html-container"
          dangerouslySetInnerHTML={{ __html: reportData.htmlReport }}
        />
        
        {/* Add print/download button */}
        {showPrintButton && (
          <div className="fixed bottom-8 right-8 flex gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              Print / Save PDF
            </button>
          </div>
        )}
        
        {/* Print styles */}
        <style jsx global>{`
          @media print {
            .fixed { display: none; }
            body { margin: 0; }
          }
          .report-html-container {
            min-height: 100vh;
          }
        `}</style>
      </div>
    );
  }
  
  // Fallback to old format (sections-based report)
  const sections = reportData.sections || reportData.report?.sections || [];
  const businessName = reportData.businessInfo?.companyName || reportData.companyName || 'Your Business';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <EnhancedReport 
        sections={sections}
        businessName={businessName}
        onClose={() => {
          console.log('Report closed');
        }}
      />
    </div>
  );
}