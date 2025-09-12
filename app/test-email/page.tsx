'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('Test');
  const [companyName, setCompanyName] = useState('Test Company');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const sendTestEmail = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          companyName
        }),
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
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ color: '#08b2c6' }}>📧 Test Email with PDF Attachment</h1>
      <p style={{ color: '#666' }}>
        This page tests the PDF generation and email sending functionality without using GPT-5 API credits.
        It uses mock report data.
      </p>
      
      <div style={{ marginTop: '30px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <button
          onClick={sendTestEmail}
          disabled={loading || !email}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#08b2c6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading || !email ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending Test Email...' : 'Send Test Email with PDF'}
        </button>
      </div>
      
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#efe',
          border: '1px solid #cfc',
          borderRadius: '4px',
          color: '#060'
        }}>
          <strong>✅ Success!</strong>
          <ul>
            <li>Email sent to: {result.recipient}</li>
            <li>PDF size: {result.pdfSize} bytes</li>
            <li>Check your inbox for the test email with PDF attachment</li>
          </ul>
        </div>
      )}
      
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h3>📋 What This Tests:</h3>
        <ul>
          <li>PDF generation with mock report data</li>
          <li>Character sanitization (removes special Unicode characters)</li>
          <li>SendGrid email delivery</li>
          <li>PDF attachment encoding</li>
          <li>Email HTML formatting</li>
        </ul>
        <p><strong>Note:</strong> This uses mock data and does NOT call GPT-5 API.</p>
      </div>
    </div>
  );
}