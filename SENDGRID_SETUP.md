# SendGrid Setup Guide

## Current Issue
The SendGrid API key is showing "Unauthorized" errors. This needs to be resolved before email functionality will work.

## Required Steps

### 1. Create a New API Key
1. Go to [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys)
2. Click "Create API Key"
3. Name it: "AI Survey and Forms Email"
4. Select "Full Access" or at minimum "Mail Send" permission
5. Copy the ENTIRE key (it starts with `SG.` and is very long)

### 2. Verify Sender Email
1. Go to [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Add `joe@ezwai.com` as a verified sender
3. Complete the verification process (check email for verification link)

### 3. Complete SendGrid Integration Test
Run the verification script we created:
```bash
node verify-sendgrid.js
```

If successful, you'll see:
```
✅ SUCCESS: Email sent successfully!
Your SendGrid API key is verified and working.
```

### 4. Update Environment Variables

#### Local Development (.env.local)
```
SENDGRID_API_KEY=SG.your-complete-api-key-here
```

#### Railway Production
1. Go to your Railway project
2. Click on the service
3. Go to Variables tab
4. Update `SENDGRID_API_KEY` with the complete, valid key

## Troubleshooting

### Error: Unauthorized (401)
- API key is invalid, expired, or incomplete
- Create a new API key with proper permissions

### Error: Forbidden (403)  
- Sender email not verified
- Verify joe@ezwai.com in SendGrid dashboard

### Error: Rate Limit
- You've hit SendGrid's rate limits
- Wait and try again or upgrade your SendGrid plan

## Testing Email Functionality

Once SendGrid is properly configured:

1. Test the verification script:
```bash
node verify-sendgrid.js
```

2. Test in the app:
- Complete a survey
- Click "Email Me The Report Instead" when it appears
- Check that the email is sent successfully

## Important Notes

- The current API key in the codebase appears to be invalid or revoked
- You need to create a new API key and update it in both local and production environments
- Email functionality will not work until this is resolved
- The "skip-wait and email" feature depends on this being fixed