'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import EnhancedReport from '@/components/report/EnhancedReport';

export default function ViewReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', reportId)
          .single();

        if (error) {
          console.error('Error fetching report:', error);
          setError('Report not found');
          return;
        }

        if (data) {
          setReportData(data.report_data);
          
          // Update access tracking
          await supabase
            .from('reports')
            .update({
              accessed_at: new Date().toISOString(),
              access_count: (data.access_count || 0) + 1
            })
            .eq('id', reportId);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    }

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-xl text-gray-600">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-gray-600">No report data available</p>
        </div>
      </div>
    );
  }

  // Check if we have an HTML report (new format)
  if (reportData.htmlReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div 
          className="report-html-container"
          dangerouslySetInnerHTML={{ __html: reportData.htmlReport }}
        />
        
        {/* Add print/download button */}
        <div className="fixed bottom-8 right-8 flex gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Print / Save PDF
          </button>
        </div>
        
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
          // Optional: redirect or show a message
          console.log('Report closed');
        }}
      />
    </div>
  );
}