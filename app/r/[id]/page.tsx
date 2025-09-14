'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportId) {
      console.log('[Report Page] Loading report:', reportId);
      
      // Fetch the report HTML from API and display it
      fetch(`/api/reports/${reportId}`)
        .then(async res => {
          console.log('[Report Page] Response status:', res.status);
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            console.error('[Report Page] Error response:', errorData);
            throw new Error(errorData.error || 'Report not found');
          }
          
          const contentType = res.headers.get('content-type');
          console.log('[Report Page] Content type:', contentType);
          
          if (contentType?.includes('text/html')) {
            return res.text();
          } else {
            // If JSON response, it means no HTML was found
            const data = await res.json();
            console.error('[Report Page] No HTML in response:', data);
            throw new Error(data.error || 'HTML report not available');
          }
        })
        .then(html => {
          console.log('[Report Page] Received HTML, length:', html.length);
          // Write the HTML to the document
          document.open();
          document.write(html);
          document.close();
        })
        .catch(err => {
          console.error('[Report Page] Error loading report:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [reportId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Report</h2>
          <p className="text-lg">{error}</p>
          <p className="text-sm text-gray-600 mt-4">Report ID: {reportId}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading report...</p>
        </div>
      </div>
    );
  }

  return null;
}