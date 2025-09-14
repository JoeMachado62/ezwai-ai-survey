import { NextRequest, NextResponse } from "next/server";
import sgMail from '@sendgrid/mail';
import { getSupabaseAdmin } from '@/lib/supabase';

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
      reportSections,
      skipWait = false
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Save report to Supabase and get shareable link
    let reportUrl = '';
    let reportId = '';
    
    if (reportData || reportSections) {
      try {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
          .from('reports')
          .insert({
            company_name: companyName || 'Unknown Company',
            email: email,
            report_data: {
              businessInfo: { companyName },
              contactInfo: { firstName, lastName, email },
              report: reportData,
              sections: reportSections,
              questions: body.questions || [],
              answers: body.answers || {}
            }
          })
          .select()
          .single();

        if (!error && data) {
          reportId = data.id;
          reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-survey-production.up.railway.app'}/view-report/${data.id}`;
          console.log('Report saved to Supabase with ID:', reportId);
        } else {
          console.error('Failed to save report to Supabase:', error);
        }
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      }
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
              <p>Thank you for your patience! We've completed the comprehensive analysis of ${companyName || 'your business'} and your personalized AI Opportunities Report is ready.</p>
              <p>While you were away, our AI conducted deep research across multiple sources to identify specific opportunities for your business.</p>
            ` : `
              <p>Thank you for taking the time to complete our AI assessment! Your personalized AI Opportunities Report for ${companyName || 'your business'} is ready.</p>
              <p>We've identified several immediate opportunities where AI can transform your operations and drive growth.</p>
            `}
            
            ${reportUrl ? `
              <center style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #f0feff, #e6fafe); border-radius: 12px;">
                <h2 style="color: #08b2c6; margin-bottom: 20px;">Your Report is Ready!</h2>
                <a href="${reportUrl}" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #08b2c6, #0891a1); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(8, 178, 198, 0.3);">
                  📊 View Your Interactive Report Now
                </a>
                <p style="color: #4b5563; font-size: 16px; margin-top: 20px;">
                  <strong>Click the button above to:</strong><br>
                  ✓ View your beautifully formatted report<br>
                  ✓ Download the stylized PDF with all images<br>
                  ✓ Access your report anytime from any device
                </p>
              </center>
            ` : reportPdfBase64 ? `
              <p><strong>Your report is attached to this email as a PDF.</strong></p>
            ` : '<p><strong>Error: Report link could not be generated. Please contact support.</strong></p>'}
            
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
    
    const msg: any = {
      to: email,
      from: 'joe@ezwai.com',
      bcc: ['joe@ezwai.com', 'shawn@ezwai.com'],  // BCC for tracking
      subject: `${firstName}, Your AI Opportunities Report is Ready!`,
      html: emailHtml
    };
    
    // Only attach PDF if it's available
    if (reportPdfBase64) {
      msg.attachments = [
        {
          content: reportPdfBase64,
          filename: `AI-Report-${companyName?.replace(/\s+/g, '-') || 'Report'}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ];
    }
    
    await sgMail.send(msg);
    

    // For now, return success (you'll need to implement actual email sending)
    console.log('Email would be sent to:', email);
    console.log('Skip wait mode:', skipWait);
    
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      recipient: email,
      reportUrl: reportUrl,
      reportId: reportId
    });

  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}