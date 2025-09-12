'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('joemachado62@ezwai.com');
  const [firstName, setFirstName] = useState('Joe');
  const [companyName, setCompanyName] = useState('EZWAI Test Company');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTestEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, companyName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#08b2c6', marginBottom: '30px' }}>📧 Test Email with PDF Attachment</h1>
      
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 10px 0', color: '#6b7280' }}>
          This will send a test email with a styled PDF report attachment using mock data.
        </p>
        <p style={{ margin: 0, color: '#e1530a', fontWeight: 'bold' }}>
          ⚠️ Real email will be sent via SendGrid
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
          Email Address:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
          First Name:
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
          Company Name:
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <button
        onClick={sendTestEmail}
        disabled={loading || !email}
        style={{
          background: loading ? '#9ca3af' : '#08b2c6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {loading ? '⏳ Sending Test Email...' : '🚀 Send Test Email with PDF'}
      </button>
      
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '6px',
          color: '#16a34a'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>✅ Success!</h3>
          <p style={{ margin: '5px 0' }}>Email sent to: <strong>{result.recipient}</strong></p>
          <p style={{ margin: '5px 0' }}>PDF size: <strong>{Math.round(result.pdfSize / 1024)} KB</strong></p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Check your inbox for the test email with the styled PDF attachment.
          </p>
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
        <h4 style={{ margin: '0 0 10px 0', color: '#111827' }}>What this test includes:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Server-side PDF generation using @react-pdf/renderer</li>
          <li>5 styled report sections with GoHighLevel focus</li>
          <li>Professional formatting and branding</li>
          <li>Mock data for automobile broker industry</li>
          <li>SendGrid email delivery with attachment</li>
        </ul>
      </div>
    </div>
  );
}