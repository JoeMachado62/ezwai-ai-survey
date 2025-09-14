'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ReportsListPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching reports:', error);
        } else if (data) {
          setReports(data);
          console.log(`Found ${data.length} reports`);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const viewReport = (report: any) => {
    setSelectedReport(report);
    // If HTML report exists, display it
    if (report.report_data?.htmlReport) {
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>AI Report - ${report.company_name}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body style="margin: 0; background: #f9fafb;">
            ${report.report_data.htmlReport}
            <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; display: flex; gap: 10px;">
              <button onclick="window.print()" style="padding: 12px 24px; background: #08b2c6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                Print / Save PDF
              </button>
              <button onclick="window.close()" style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                Close
              </button>
            </div>
          </body>
          </html>
        `);
        reportWindow.document.close();
      }
    } else {
      alert('This report does not have HTML content. It may be an older format.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-width-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Reports</h1>
        
        {reports.length === 0 ? (
          <p className="text-gray-600">No reports found.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {report.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewReport(report)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Report
                      </button>
                      <Link 
                        href={`/view-report/${report.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Try Direct Link
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Click "View Report" to open the report in a new window. 
            If "Try Direct Link" doesn't work, use the View Report button instead.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Looking for report ID: <code className="bg-gray-100 px-2 py-1 rounded">dfc2f3e7-e270-4c5f-bf48-855ebd95f088</code>
          </p>
        </div>
      </div>
    </div>
  );
}