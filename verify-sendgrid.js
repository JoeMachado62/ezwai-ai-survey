// SendGrid API Key Verification Script
// Run this to verify your SendGrid integration

const sgMail = require('@sendgrid/mail');

// Use the API key from environment
// You must set SENDGRID_API_KEY in your environment variables
const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: SENDGRID_API_KEY environment variable is not set');
  console.log('\nTo set it temporarily for testing:');
  console.log('Windows: set SENDGRID_API_KEY=your-api-key');
  console.log('Mac/Linux: export SENDGRID_API_KEY=your-api-key');
  console.log('\nThen run this script again.');
  process.exit(1);
}

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
      
      if (error.code === 401) {
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