import { NextRequest, NextResponse } from 'next/server';
import { callResponses } from '@/lib/openai';

// HTML Report Schema - expects structured HTML sections
const HtmlReportJsonSchema = {
  name: "HtmlReportSchema",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["htmlReport", "sources"],
    properties: {
      htmlReport: { 
        type: "string",
        description: "Complete HTML report with inline styles and structure"
      },
      sources: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          required: ["title", "url"],
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            url: { type: "string" }
          }
        }
      }
    }
  }
} as const;

const HTML_DESIGN_SYSTEM_PROMPT = `You are an expert HTML report designer creating magazine-quality business reports.

CRITICAL RULES:
1. NO citation artifacts like [1], [2], etc. in the text
2. NO emoji headers - use proper HTML hero sections
3. Create magazine-style layouts with image overlays

DESIGN SYSTEM:
- Primary: Teal (#08b2c6) with gradients to (#b5feff)
- Accent: Orange (#ff6b35) with gradients to (#ffa947) 
- Cards: White with box-shadow: 0 4px 20px rgba(0,0,0,0.1)
- Border-radius: 16px for cards, 8px for elements
- Font: system-ui, -apple-system, sans-serif

HERO SECTION TEMPLATE FOR EACH MAJOR SECTION:
<div style="height:400px; background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%), url('[IMAGE:section-name]'); background-size:cover; background-position:center; display:flex; align-items:flex-end; color:white; padding:48px; border-radius:16px; margin-bottom:32px;">
  <div>
    <div style="font-size:24px; opacity:0.9; margin-bottom:8px;">Section {number}</div>
    <h2 style="font-size:48px; font-weight:bold; margin:0;">{Section Title}</h2>
  </div>
</div>

REQUIRED STRUCTURE:
1. Main hero with company name (full width gradient overlay)
2. Each section starts with hero banner (image with dark overlay)
3. Content in white cards below hero
4. Blue callout boxes (#e0f7ff) with left border
5. Quick wins in gradient cards (no emojis in headers)
6. Tables with alternating row colors

FORMATTING RULES:
- Use hero banners, NOT emoji headers
- Clean text without citation marks
- Professional typography
- Image placeholders in hero backgrounds
- Proper spacing and hierarchy`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyInfo, techStack, report } = body;
    
    // Simulate full survey context like production
    const fullContext = {
      companyName: companyInfo?.companyName || 'ABC Marketing Agency',
      industry: companyInfo?.industry || 'Digital Marketing',
      employees: companyInfo?.employees || '25-50',
      revenue: companyInfo?.revenue || '$1M-$5M',
      websiteURL: companyInfo?.websiteURL || 'https://abcmarketing.com',
      crmSystem: techStack?.crmSystem || 'GoHighLevel',
      aiTools: techStack?.aiTools || 'ChatGPT for content, Canva for graphics',
      biggestChallenge: techStack?.biggestChallenge || 'Creating personalized content at scale for multiple clients while maintaining quality',
      socialChannels: ['LinkedIn', 'Instagram', 'Facebook'],
      contentTime: '20+ hours',
      // Simulate survey answers
      surveyAnswers: [
        'Q: What tasks take the most time? A: Content creation, client reporting, campaign optimization',
        'Q: Current automation? A: Basic email sequences, some Zapier workflows',
        'Q: Team bottlenecks? A: Manual social media posting, repetitive client reports',
        'Q: Growth goals? A: Scale to 100+ clients without proportional team growth',
        'Q: Budget for AI? A: $500-$2000/month for the right solutions'
      ]
    };
    
    const userPrompt = `Create a comprehensive HTML report for ${fullContext.companyName}.

==== COMPANY PROFILE ====
Company: ${fullContext.companyName}
Website: ${fullContext.websiteURL}
Industry: ${fullContext.industry}
Size: ${fullContext.employees} employees
Revenue: ${fullContext.revenue}

==== CURRENT TECHNOLOGY ====
CRM: ${fullContext.crmSystem}
AI Tools: ${fullContext.aiTools}
Biggest Challenge: "${fullContext.biggestChallenge}"

==== MARKETING PROFILE ====
Active Channels: ${fullContext.socialChannels.join(', ')}
Content Time: ${fullContext.contentTime} per week

==== KEY INSIGHTS FROM ASSESSMENT ====
${fullContext.surveyAnswers.join('\n')}

==== REPORT REQUIREMENTS ====

Generate a magazine-quality HTML report with these sections:

1. HERO SECTION: Company name, "AI Transformation Report", gradient background

2. EXECUTIVE SUMMARY: 
   - Reference their specific challenge with content scaling
   - Highlight GoHighLevel AI capabilities
   - 2-3 paragraphs with key opportunities

3. QUICK WINS (3 items):
   - GoHighLevel AI chatbot for client inquiries
   - Automated content generation workflows
   - Smart client reporting dashboards
   Each with timeframe (2-4 weeks) and impact metrics

4. INDUSTRY INSIGHT CALLOUT:
   Blue box highlighting how agencies using GoHighLevel + AI are scaling

5. STRATEGIC RECOMMENDATIONS (3 items):
   - Full GoHighLevel migration strategy
   - AI-powered content factory setup
   - White-label AI services for clients
   Each with specific ROI projections

6. COMPETITIVE ANALYSIS:
   - Research how top agencies use AI
   - Compare with current market leaders
   - Include comparison table

7. IMPLEMENTATION ROADMAP:
   - Month 1: Foundation and setup
   - Month 2: Automation deployment
   - Month 3: Scale and optimize

8. NEXT STEPS:
   - Schedule GoHighLevel demo
   - AI audit consultation
   - Team training plan

STYLING REQUIREMENTS:
- Use all design system colors and gradients
- Each section in a styled card
- Include [IMAGE:section] placeholders
- Professional magazine layout
- Mobile responsive

Use web search to find real data about:
- Digital marketing agency AI adoption
- GoHighLevel success stories
- Industry benchmarks and trends

Return comprehensive HTML (up to 10,000 chars) with 5+ real sources.

IMPORTANT HTML REQUIREMENTS:
- Each section MUST have a hero banner with image overlay (not emoji headers)
- NO citation artifacts [1], [2] etc. in the body text
- Professional magazine layout like high-end business reports
- Use the hero section template provided for each major section
- Sources should be listed at the end, not inline`;

    console.log('[HTML Test] Generating HTML report with GPT-5...');
    
    const result = await callResponses<{ htmlReport: string; sources: any[] }>({
      input: [
        { role: "system", content: HTML_DESIGN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: HtmlReportJsonSchema,
      tools: [{ type: "web_search" }],  // Enable web search for real data
      model: process.env.OPENAI_MODEL_REPORT || "gpt-5",  // Use FULL GPT-5 model
      reasoning_effort: "low",  // Minimum required for web search
      verbosity: "medium"  // Balanced output without artifacts
    });

    console.log('[HTML Test] Successfully generated HTML report');
    
    // Post-process to add actual image URLs from env variables
    let processedHtml = result.htmlReport;
    
    // Replace image placeholders with actual URLs if available
    const imageMap: Record<string, string> = {
      '[IMAGE:executive-summary]': process.env.NEXT_PUBLIC_REPORT_IMAGE_EXECUTIVE || '/images/executive-summary.jpg',
      '[IMAGE:quick-wins]': process.env.NEXT_PUBLIC_REPORT_IMAGE_QUICKWINS || '/images/quick-wins.jpg',
      '[IMAGE:roadmap]': process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || '/images/roadmap.jpg',
      '[IMAGE:competitive]': process.env.NEXT_PUBLIC_REPORT_IMAGE_COMPETITIVE || '/images/competitive.jpg',
      '[IMAGE:implementation]': process.env.NEXT_PUBLIC_REPORT_IMAGE_IMPLEMENTATION || '/images/implementation.jpg'
    };
    
    Object.entries(imageMap).forEach(([placeholder, url]) => {
      processedHtml = processedHtml.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<img src="${url}" alt="${placeholder.replace(/[\[\]:]/g, '')}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />`
      );
    });
    
    return NextResponse.json({
      success: true,
      htmlReport: processedHtml,
      sources: result.sources,
      rawHtml: result.htmlReport  // Keep original for debugging
    });
    
  } catch (error) {
    console.error('[HTML Test] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate HTML report', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}