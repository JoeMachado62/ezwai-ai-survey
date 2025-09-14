'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportId) {
      // Fetch the report HTML from API and display it
      fetch(`/api/reports/${reportId}`)
        .then(res => {
          if (!res.ok) throw new Error('Report not found');
          return res.text();
        })
        .then(html => {
          // Write the HTML to the document
          document.open();
          document.write(html);
          document.close();
        })
        .catch(err => {
          setLoading(false);
          console.error('Error loading report:', err);
        });
    }
  }, [reportId]);

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