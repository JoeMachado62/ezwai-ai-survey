'use client';

import { useState } from 'react';

export default function TestCompletePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCompleteFlow = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Mock data for testing
      const testData = {
        companyInfo: {
          companyName: "EZWAI Test Company",
          websiteURL: "https://ezwai.com",
          industry: "Software Development",
          employees: "10-20",
          revenue: "$1M-$5M"
        },
        techStack: {
          crmSystem: "Currently using spreadsheets",
          aiTools: "None yet",
          biggestChallenge: "Lead generation and follow-up automation"
        },
        socialMedia: {
          channels: ["LinkedIn", "Facebook"],
          contentTime: "10-20 hours"
        },
        answers: {
          "How do you currently track leads?": "Manual spreadsheets",
          "What's your monthly marketing budget?": "$5,000",
          "How many leads do you generate monthly?": "50-100"
        },
        aiSummary: "Company needs automation for lead generation and CRM",
        emailDetails: {
          sendEmail: true,
          email: "joemachado62@ezwai.com",
          firstName: "Joe",
          lastName: "Machado"
        }
      };
      
      const response = await fetch('/api/report/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }
      
      setResult(data);
      
      // If PDF was generated, create download link
      if (data.pdfBase64) {
        try {
          // Properly decode base64 to binary
          const binaryString = atob(data.pdfBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Auto-download the PDF
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = 'AI_Report_Test.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Clean up
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
        } catch (err) {
          console.error('PDF download error:', err);
        }
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#08b2c6', marginBottom: '30px' }}>
        🚀 Test Complete Report Flow
      </h1>
      
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0 }}>This single API endpoint will:</h3>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Generate AI report using GPT-5 with GoHighLevel focus</li>
          <li>Transform report into styled sections</li>
          <li>Generate Railway-compatible PDF</li>
          <li>Send email with PDF attachment to joemachado62@ezwai.com</li>
          <li>Return complete response with report data and PDF</li>
        </ol>
        <p style={{ margin: '10px 0', color: '#e1530a', fontWeight: 'bold' }}>
          ⚠️ This will use real OpenAI API credits and send a real email
        </p>
      </div>
      
      <button
        onClick={testCompleteFlow}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#08b2c6',
          color: 'white',
          padding: '14px 28px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '18px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '20px'
        }}
      >
        {loading ? '⏳ Generating Complete Report (30-60s)...' : '🎯 Test Complete Report Flow'}
      </button>
      
      {error && (
        <div style={{
          padding: '15px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{
          padding: '20px',
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '6px',
          color: '#16a34a'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>✅ Complete Report Generated!</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Report Sections:</strong>
            <ul style={{ margin: '5px 0' }}>
              {result.sections?.map((section: any, i: number) => (
                <li key={i}>{section.title}</li>
              ))}
            </ul>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>PDF Size:</strong> {result.pdfBase64 ? 
              `${Math.round(atob(result.pdfBase64).length / 1024)} KB` : 'N/A'}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Email Status:</strong> {result.emailSent ? 
              '✅ Sent to joemachado62@ezwai.com' : '❌ Not sent'}
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f3f4f6', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <strong>Executive Summary:</strong>
            <p style={{ margin: '10px 0' }}>
              {result.report?.executiveSummary?.substring(0, 200)}...
            </p>
          </div>
        </div>
      )}
      
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f3f4f6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#111827' }}>How this works:</h4>
        <p>
          This is a complete, production-ready flow that combines all the pieces:
        </p>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Single API call to <code>/api/report/complete</code></li>
          <li>Generates full AI report with GoHighLevel prioritization</li>
          <li>Creates professional PDF without external dependencies</li>
          <li>Sends email with attachment via SendGrid</li>
          <li>Works on Railway and other serverless platforms</li>
          <li>No Puppeteer, no browser dependencies</li>
        </ul>
        <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
          This is the flow that should be used in production!
        </p>
      </div>
    </div>
  );
}