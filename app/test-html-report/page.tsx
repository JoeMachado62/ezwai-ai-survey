'use client';

import { useState } from 'react';
import { LoadingDots } from '@/components/LoadingDots';

export default function TestHtmlReport() {
  const [loading, setLoading] = useState(false);
  const [htmlReport, setHtmlReport] = useState<string>('');
  const [rawHtml, setRawHtml] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [showRaw, setShowRaw] = useState(false);
  const [testData, setTestData] = useState({
    companyName: 'ABC Marketing Agency',
    industry: 'Digital Marketing',
    employees: '25-50',
    biggestChallenge: 'Creating personalized content at scale for multiple clients',
    crmSystem: 'GoHighLevel'
  });

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-html-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyInfo: {
            companyName: testData.companyName,
            industry: testData.industry,
            employees: testData.employees
          },
          techStack: {
            biggestChallenge: testData.biggestChallenge,
            crmSystem: testData.crmSystem
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHtmlReport(data.htmlReport);
        setRawHtml(data.rawHtml || data.htmlReport);
        setSources(data.sources || []);
      } else {
        alert(`Error: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([htmlReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gpt5-html-report.html';
    a.click();
  };

  const generatePdf = async () => {
    if (!htmlReport) return;
    
    // Use the browser's print functionality to save as PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Report - ${testData.companyName}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${htmlReport}
      </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-width-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">GPT-5 HTML Report Generation Test</h1>
        
        {/* Test Configuration */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={testData.companyName}
                onChange={(e) => setTestData({...testData, companyName: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <input
                type="text"
                value={testData.industry}
                onChange={(e) => setTestData({...testData, industry: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employees</label>
              <input
                type="text"
                value={testData.employees}
                onChange={(e) => setTestData({...testData, employees: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CRM System</label>
              <input
                type="text"
                value={testData.crmSystem}
                onChange={(e) => setTestData({...testData, crmSystem: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Biggest Challenge</label>
              <textarea
                value={testData.biggestChallenge}
                onChange={(e) => setTestData({...testData, biggestChallenge: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
            </div>
          </div>
          
          <button
            onClick={runTest}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <LoadingDots /> : 'Generate HTML Report'}
          </button>
        </div>
        
        {/* Actions */}
        {htmlReport && (
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              {showRaw ? 'Show Rendered' : 'Show Raw HTML'}
            </button>
            <button
              onClick={downloadHtml}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download HTML
            </button>
            <button
              onClick={generatePdf}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Generate PDF
            </button>
          </div>
        )}
        
        {/* Sources */}
        {sources.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold mb-2">Sources from Web Search:</h3>
            <ul className="space-y-1">
              {sources.map((source, i) => (
                <li key={i}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Report Display */}
        {htmlReport && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {showRaw ? 'Raw HTML Code' : 'Rendered Report'}
            </h2>
            {showRaw ? (
              <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {rawHtml}
              </pre>
            ) : (
              <div 
                dangerouslySetInnerHTML={{ __html: htmlReport }}
                className="report-preview"
              />
            )}
          </div>
        )}
        
        {/* Comparison Notes */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Experiment Notes:</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ This tests GPT-5's ability to generate styled HTML directly</li>
            <li>✓ Image placeholders are replaced with env URLs automatically</li>
            <li>✓ All styling is inline - no external CSS needed</li>
            <li>✓ The HTML can be directly converted to PDF</li>
            <li>✓ Compare with EnhancedReport.tsx output for quality</li>
          </ul>
          
          <h4 className="font-semibold mt-4 mb-2">Potential Benefits:</h4>
          <ul className="space-y-1 text-sm">
            <li>• GPT-5 handles formatting nuances better</li>
            <li>• Easier to tweak prompt than React components</li>
            <li>• Single source of truth for design</li>
            <li>• Could eliminate complex PDF generation logic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}