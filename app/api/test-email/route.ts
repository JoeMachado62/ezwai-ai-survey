import { NextResponse } from "next/server";
import { generateRailwayPdfBuffer } from "@/lib/generateRailwayPdf";
import type { ReportSection } from "@/lib/report-types";

// Transform report data into sections for the new PDF generator
function transformToSections(companyName: string): ReportSection[] {
  return [
    {
      title: "Executive Summary",
      mainContent: `**AI Transformation Overview for ${companyName}**

Based on our comprehensive analysis of your automobile brokerage business, we've identified significant opportunities to leverage AI and GoHighLevel's platform to transform your lead generation and customer acquisition processes.

Your primary challenge of generating new leads can be directly addressed through GoHighLevel's AI-powered automation suite, which includes intelligent chatbots, automated lead scoring, and multi-channel campaign management.

**Key Opportunities:**
• Implement GoHighLevel's Conversational AI for 24/7 lead capture
• Deploy automated social media lead generation workflows
• Create intelligent email sequences with behavior-based triggers
• Build a predictive lead scoring system within the GHL platform`,
      keyTakeaways: [
        "GoHighLevel can increase your lead generation by 40-60% within 30 days",
        "AI automation can reduce manual follow-up time by 75%",
        "Integrated CRM and marketing automation eliminates the need for multiple tools"
      ],
      pullQuote: "Companies using GoHighLevel's AI features report 3x higher conversion rates",
      statistic: {
        value: "287%",
        description: "Average ROI for businesses using GoHighLevel's full automation suite"
      },
      imagePrompt: "Professional business executive reviewing AI analytics dashboard",
      imageUrl: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/682e45427b03233d423f353f.webp"
    },
    {
      title: "Quick Wins - 30 Day Implementation",
      mainContent: `**1. GoHighLevel AI Chatbot Deployment**
Implement GoHighLevel's Conversational AI on your website to qualify leads 24/7. The chatbot can answer questions about vehicle sourcing, collect contact information, and automatically schedule consultations directly into your GHL calendar.

*Timeframe: 1 week* | *Impact: 40-60% increase in qualified leads*

**2. Automated Review Management**
Use GoHighLevel's reputation management tools to automatically request reviews from satisfied clients and respond to feedback with AI-generated responses. This builds trust and improves local SEO.

*Timeframe: 3 days* | *Impact: 25% increase in positive reviews*

**3. Smart Email & SMS Campaigns**
Set up GoHighLevel's AI-driven email and SMS sequences that nurture leads based on their behavior. The platform's built-in AI can personalize messages and optimize send times.

*Timeframe: 1 week* | *Impact: 3x improvement in engagement rates*`,
      keyTakeaways: [
        "All quick wins can be implemented within GoHighLevel's platform",
        "No additional software or integrations required",
        "Expected combined impact: 200%+ increase in qualified leads"
      ],
      imagePrompt: "Team celebrating quick wins and achievements with charts",
      imageUrl: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb055f7235614c5090e379.webp"
    },
    {
      title: "Strategic AI Roadmap",
      mainContent: `**Phase 1: Foundation (Months 1-2)**
• Migrate existing contacts to GoHighLevel CRM
• Set up AI-powered lead scoring and segmentation
• Implement basic automation workflows
• Configure tracking and analytics

**Phase 2: Expansion (Months 3-4)**
• Deploy advanced GoHighLevel features like pipeline automation
• Create custom AI workflows for specific lead sources
• Implement GoHighLevel's membership site for client portals
• Set up white-label capabilities for scalability

**Phase 3: Optimization (Months 5-6)**
• Use GoHighLevel's AI insights to optimize campaigns
• Implement predictive analytics for sales forecasting
• Create automated reporting dashboards
• Scale successful campaigns across new channels

**Expected Outcomes:**
• 300% increase in marketing qualified leads
• 50% reduction in cost per acquisition
• 75% time savings on manual tasks
• Complete marketing and sales alignment`,
      keyTakeaways: [
        "GoHighLevel provides all tools needed for each phase",
        "No need to integrate multiple disparate systems",
        "ROI typically achieved within 60-90 days"
      ],
      statistic: {
        value: "$47,000",
        description: "Average annual savings from consolidating tools into GoHighLevel"
      },
      imagePrompt: "Strategic roadmap with AI integration milestones and timeline",
      imageUrl: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f916e86860b82f699ef.jpeg"
    },
    {
      title: "Competitive Intelligence",
      mainContent: `**Market Analysis:**
In the automobile broker industry, early AI adopters using platforms like GoHighLevel are seeing significant advantages:

• **Lead Generation:** 40-70% more qualified leads than traditional methods
• **Conversion Rates:** 3x higher than industry average
• **Customer Lifetime Value:** 45% increase through automated nurturing
• **Operational Efficiency:** 60% reduction in administrative tasks

**GoHighLevel Advantage:**
While your competitors may be using basic chatbots or email tools, GoHighLevel's all-in-one platform provides:
• Unified customer data across all touchpoints
• AI-powered insights that improve over time
• White-label capabilities for building your own brand
• Continuous platform updates with new AI features

**Competitive Positioning:**
By implementing GoHighLevel now, you'll leapfrog competitors still using fragmented solutions. The platform's comprehensive nature means you can move faster and iterate quicker than companies juggling multiple tools.`,
      keyTakeaways: [
        "GoHighLevel users report 40% faster implementation than multi-tool setups",
        "Platform consolidation reduces technical debt and training time",
        "AI features give sustainable competitive advantage"
      ],
      imagePrompt: "Competitive analysis dashboard showing market positioning",
      imageUrl: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/6829ebbb8e6261cf7632eb06.webp"
    },
    {
      title: "Your Implementation Roadmap",
      mainContent: `**Immediate Next Steps:**

**Week 1: GoHighLevel Setup**
1. Schedule your GoHighLevel demo and onboarding call
2. Import existing contacts and set up your account structure
3. Configure your first AI chatbot for lead capture
4. Set up basic email automation sequences

**Week 2: Campaign Launch**
5. Create your first automated lead nurturing campaign
6. Set up SMS follow-up sequences
7. Configure appointment scheduling automation
8. Implement review request automation

**Week 3: Optimization**
9. Review initial metrics and optimize workflows
10. Set up advanced features like pipeline automation
11. Create custom reports and dashboards
12. Plan expansion into additional channels

**Success Metrics to Track:**
• Number of leads generated per week
• Lead-to-appointment conversion rate
• Average response time to inquiries
• Customer acquisition cost
• Return on ad spend (ROAS)

**Support Resources:**
• GoHighLevel 24/7 support team
• Comprehensive video training library
• Active user community and forums
• EZWAI implementation assistance`,
      keyTakeaways: [
        "Full implementation achievable within 30 days",
        "GoHighLevel provides extensive onboarding support",
        "EZWAI team available for personalized assistance"
      ],
      pullQuote: "The best time to implement AI was yesterday. The second best time is now.",
      imagePrompt: "Implementation roadmap with clear action steps and timeline",
      imageUrl: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d67354ea6fab47017.jpeg"
    }
  ];
}

// Mock report data for testing
const mockReport = {
  executiveSummary: "This is a test executive summary for cARLUCENT, an automobile broker specializing in vehicle buyer services. Based on your challenge with lead generation, we've identified several AI-powered opportunities to transform your business operations and customer acquisition strategy.",
  quickWins: [
    {
      title: "Implement AI-Powered Lead Capture Chatbot",
      description: "Deploy an intelligent chatbot on your website that qualifies leads 24/7, answers common questions about vehicle sourcing, and schedules consultations automatically. This can integrate with your existing CRM to track lead sources and conversion rates.",
      timeframe: "2-3 weeks",
      impact: "40-60% increase in qualified leads"
    },
    {
      title: "Automate Social Media Lead Generation",
      description: "Use AI tools to monitor social media for people discussing car purchases, automatically engage with relevant posts, and direct them to your services. Tools like Phantom Buster can automate LinkedIn and Facebook outreach.",
      timeframe: "1-2 weeks",
      impact: "25-30 new leads per week"
    },
    {
      title: "Smart Email Campaign Automation",
      description: "Set up AI-driven email sequences that nurture leads based on their behavior and interests. Use tools like ActiveCampaign to send personalized vehicle recommendations and market updates.",
      timeframe: "1 week",
      impact: "3x improvement in email engagement"
    }
  ],
  recommendations: [
    {
      title: "Build Predictive Lead Scoring System",
      description: "Implement machine learning models to score and prioritize leads based on likelihood to convert. This helps focus your efforts on high-value prospects and optimize your sales process.",
      roi: "35% increase in conversion rate"
    },
    {
      title: "Create AI-Powered Vehicle Matching Engine",
      description: "Develop a recommendation system that matches buyers with ideal vehicles based on their preferences, budget, and needs. This can differentiate your service from competitors.",
      roi: "50% reduction in search time, 2x client satisfaction"
    }
  ],
  competitiveAnalysis: "In the automobile broker industry, early AI adopters are seeing significant advantages. Companies using AI for lead generation report 40-70% more qualified leads. Your competitors may already be using basic chatbots, but comprehensive AI integration for lead scoring, automated outreach, and predictive analytics remains rare, giving you an opportunity to leapfrog the competition.",
  nextSteps: [
    "Here's your personalized action plan:",
    "1. Schedule a demo with Intercom or Drift for chatbot implementation",
    "2. Set up Phantom Buster for social media automation",
    "3. Configure ActiveCampaign for email automation",
    "4. Implement Google Analytics 4 with AI insights",
    "5. Review weekly metrics and optimize AI tools based on performance"
  ],
  sources: []
};

// Helper function to sanitize text for PDF generation
function sanitizeForPDF(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018-\u201F]/g, "'")
    .replace(/[\u201C-\u201D]/g, '"')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[\u2022]/g, '•')
    .replace(/[\u2013]/g, '-')
    .replace(/[\u2014]/g, '--')
    .replace(/[\u00AD]/g, '')
    .replace(/[\u200B-\u200F]/g, '')
    .replace(/cite[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*[a-z0-9_-]*(?:turn\d+|search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/\bturn\d+(?:search\d+|news\d+)*[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]*/gi, '')
    .replace(/[⭐★☆✦✧✨✩✪✫✬✭✮✯✰⋆]+/g, '')
    .replace(/\bcite[^.\s,;!?]*\*/gi, '')
    .replace(/\[\d+\]/g, '')
    .replace(/【[\d:]+†source】/g, '')
    .replace(/〔[\d:]+－source〕/g, '')
    .replace(/\s*\*+\s*/g, ' ')
    .replace(/\s*\.\s*\*/g, '.')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/^\s*[•·]\s*/gm, '• ')
    .trim();
}

export async function POST(request: Request) {
  let pdfBuffer: Buffer | null = null;
  
  try {
    const { email, firstName, companyName } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    console.log("[Test Email] Generating Railway-compatible PDF...");
    
    // Generate mock sections (with fewer to reduce size)
    const testSections = transformToSections(companyName || 'Test Company').slice(0, 2); // Only 2 sections for testing
    
    // Generate PDF using Railway-compatible renderer
    pdfBuffer = await generateRailwayPdfBuffer(
      testSections,
      companyName || 'Test Company'
    );
    
    console.log("[Test Email] PDF generated, size:", pdfBuffer.length, "bytes");
    
    // Send email with SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 14px 32px; background: #08b2c6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Test Email - AI Report</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName || 'there'},</p>
            <p>This is a <strong>TEST EMAIL</strong> to verify PDF attachment functionality.</p>
            <p>The attached PDF contains mock data for testing purposes only.</p>
            <p>Company: ${companyName || 'Test Company'}</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <div class="footer">
              <p><strong>EZWAI Test System</strong><br>
              This is a test email - please ignore if received unexpectedly.<br>
              📧 joe@ezwai.com | 📱 888-503-9924</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const msg: any = {
      to: email,
      from: 'joe@ezwai.com',
      subject: `[TEST] AI Report PDF Test - ${new Date().toLocaleTimeString()}`,
      html: emailHtml,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `TEST_AI_Report_${Date.now()}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };
    
    console.log("[Test Email] Sending email to:", email);
    await sgMail.send(msg);
    console.log("[Test Email] Email sent successfully!");
    
    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully",
      pdfSize: pdfBuffer.length,
      recipient: email
    });
    
  } catch (error: any) {
    console.error("[Test Email] Error:", error);
    
    // Log SendGrid specific errors
    if (error.response?.body?.errors) {
      console.error("[Test Email] SendGrid errors:", JSON.stringify(error.response.body.errors, null, 2));
    }
    
    return NextResponse.json(
      { 
        error: "Failed to send test email", 
        details: error.message,
        sendgridErrors: error.response?.body?.errors || null,
        pdfSizeMB: pdfBuffer ? (pdfBuffer.length / 1024 / 1024).toFixed(2) : 0
      },
      { status: 500 }
    );
  }
}