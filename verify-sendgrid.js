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
  to: 'test@example.com', // Change to your recipient
  from: 'joe@ezwai.com', // Your verified sender email
  subject: 'SendGrid Integration Test',
  text: 'This is a test email to verify SendGrid integration.',
  html: '<strong>This is a test email to verify SendGrid integration.</strong>',
};

console.log('Sending test email to verify SendGrid API key...');
console.log('From:', msg.from);
console.log('To:', msg.to);

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