import { NextRequest, NextResponse } from "next/server";
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      firstName,
      lastName,
      companyName,
      reportPdfBase64,
      reportData,
      skipWait = false
    } = body;

    if (!email || !reportPdfBase64) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For now, we'll use a simple email service
    // In production, integrate with SendGrid, AWS SES, or similar
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 30px; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #08b2c6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your AI Opportunities Report is Ready!</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName || 'there'},</p>
            
            ${skipWait ? `
              <p>Thank you for your patience! We've completed the comprehensive analysis of ${companyName || 'your business'} and your personalized AI Opportunities Report is attached to this email.</p>
              <p>While you were away, our AI conducted deep research across multiple sources to identify specific opportunities for your business.</p>
            ` : `
              <p>Thank you for taking the time to complete our AI assessment! Your personalized AI Opportunities Report for ${companyName || 'your business'} is attached to this email.</p>
              <p>We've identified several immediate opportunities where AI can transform your operations and drive growth.</p>
            `}
            
            <h3>What's Inside Your Report:</h3>
            <ul>
              <li>✅ Executive summary tailored to your industry</li>
              <li>🚀 Quick wins you can implement within 30 days</li>
              <li>📈 Strategic AI roadmap for long-term growth</li>
              <li>🎯 Competitive intelligence and market insights</li>
              <li>📋 Step-by-step implementation guide</li>
            </ul>
            
            <h3>Your Next Step:</h3>
            <p>I'd love to discuss your report findings and explore how we can help you implement these AI solutions. Schedule your free 30-minute consultation to:</p>
            <ul>
              <li>Review your top 3 opportunities in detail</li>
              <li>Get answers to your implementation questions</li>
              <li>Learn about our done-for-you AI integration services</li>
            </ul>
            
            <center>
              <a href="https://ezwai.com/scheduling-calendar/" class="button">Schedule Your Free Consultation</a>
            </center>
            
            <p>Don't let your competition get ahead. The businesses that adopt AI now will dominate their markets in the next 2-3 years.</p>
            
            <div class="footer">
              <p><strong>Questions?</strong> Simply reply to this email and I'll personally respond within 24 hours.</p>
              <p>Best regards,<br>
              The EZWAI Team<br>
              <a href="https://ezwai.com">ezwai.com</a></p>
              <p style="font-size: 12px; color: #9ca3af;">You received this email because you completed the AI Opportunities Assessment at ezwai.com. We respect your privacy and will never share your information.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Sendgrid email service provider:
        
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: 'joe@ezwai.com',
      subject: `${firstName}, Your AI Opportunities Report is Ready!`,
      html: emailHtml,
      attachments: [
        {
          content: reportPdfBase64,
          filename: `AI-Report-${companyName?.replace(/\s+/g, '-') || 'Report'}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };
    
    await sgMail.send(msg);
    

    // For now, return success (you'll need to implement actual email sending)
    console.log('Email would be sent to:', email);
    console.log('Skip wait mode:', skipWait);
    
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      recipient: email
    });

  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}