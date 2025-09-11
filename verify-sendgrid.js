// SendGrid API Key Verification Script
// Run this to verify your SendGrid integration

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const sgMail = require('@sendgrid/mail');

// Use the API key from environment
const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: SENDGRID_API_KEY not found in .env.local');
  console.log('\nMake sure SENDGRID_API_KEY is set in your .env.local file');
  process.exit(1);
}

console.log('Using API key from .env.local');
console.log('Key starts with:', apiKey.substring(0, 10) + '...');

sgMail.setApiKey(apiKey);

const msg = {
  to: 'joe.machado@carlucent.net', // Primary recipient
  from: 'joe@ezwai.com', // Your verified sender email
  bcc: 'joemachado62@gmail.com', // BCC for verification
  subject: 'AI Survey - SendGrid Integration Test',
  text: 'This is a test email to verify SendGrid integration is working correctly.\n\nPrimary recipient: joe.machado@carlucent.net\nBCC recipient: joemachado62@gmail.com\n\nIf you receive this email, the integration is working perfectly!',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #08b2c6;">AI Survey - SendGrid Integration Test</h2>
      <p>This is a test email to verify SendGrid integration is working correctly.</p>
      <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #08b2c6; margin: 20px 0;">
        <p><strong>Primary recipient:</strong> joe.machado@carlucent.net</p>
        <p><strong>BCC recipient:</strong> joemachado62@gmail.com</p>
      </div>
      <p style="color: green; font-weight: bold;">✅ If you receive this email, the integration is working perfectly!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">This test confirms that the AI Survey application can send reports via email with BCC functionality.</p>
    </div>
  `,
};

console.log('Sending test email to verify SendGrid API key...');
console.log('From:', msg.from);
console.log('To:', msg.to);
console.log('BCC:', msg.bcc);

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ SUCCESS: Email sent successfully!');
    console.log('Your SendGrid API key is verified and working.');
  })
  .catch((error) => {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response body:', error.response.body);
      
      if (error.code === 401 && error.response?.body?.errors?.[0]?.message === 'Maximum credits exceeded') {
        console.log('\n⚠️  SendGrid Credits Exceeded:');
        console.log('✅ Your API key is VALID and working!');
        console.log('❌ But you have exceeded your SendGrid email credits.');
        console.log('\nTo fix this:');
        console.log('1. Log into SendGrid: https://app.sendgrid.com');
        console.log('2. Check your account limits and usage');
        console.log('3. Upgrade your plan or wait for credits to reset');
        console.log('\nNote: The API integration is working correctly!');
      } else if (error.code === 401) {
        console.log('\n⚠️  API Key Issue Detected:');
        console.log('1. Make sure your API key is complete and valid');
        console.log('2. Check that the API key has "Mail Send" permission enabled');
        console.log('3. Verify the key in SendGrid dashboard: https://app.sendgrid.com/settings/api_keys');
      } else if (error.code === 403) {
        console.log('\n⚠️  Sender Verification Issue:');
        console.log('1. The sender email (joe@ezwai.com) needs to be verified in SendGrid');
        console.log('2. Go to: https://app.sendgrid.com/settings/sender_auth');
        console.log('3. Add and verify joe@ezwai.com as a sender');
      }
    }
  });