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

const HTML_DESIGN_SYSTEM_PROMPT = `You are a world-class report designer who creates beautiful, professional HTML reports.

DESIGN SYSTEM:
- Primary gradient: background: linear-gradient(135deg, #08b2c6, #b5feff)
- Card background: white with subtle shadow (box-shadow: 0 2px 8px rgba(0,0,0,0.1))
- Border radius: 12px for cards, 6px for buttons
- Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Headers: Dark blue (#0a3d4a) with gradient underlines
- Body text: #4a5568
- Accent color: #08b2c6 (teal)

STRUCTURE REQUIREMENTS:
1. Each major section should be in a styled card container
2. Use gradient backgrounds for section headers
3. Include placeholder images with [IMAGE:section-name] markers
4. Format lists with custom bullet points (✓ for benefits, → for actions, • for general)
5. Create call-out boxes for important insights (light blue background)
6. Add visual separators between sections

HTML TEMPLATE STRUCTURE:
<div class="report-container" style="max-width: 900px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  
  <!-- Hero Section -->
  <div class="hero-section" style="background: linear-gradient(135deg, #08b2c6, #b5feff); padding: 40px; border-radius: 12px; margin-bottom: 30px; color: white;">
    <h1>AI Opportunities Report</h1>
    <p>Company name and tagline</p>
  </div>
  
  <!-- Executive Summary Card -->
  <div class="card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 25px;">
    <div class="section-header" style="background: linear-gradient(90deg, #08b2c6, transparent); padding: 15px; margin: -30px -30px 20px -30px; border-radius: 12px 12px 0 0;">
      <h2 style="color: white; margin: 0;">Executive Summary</h2>
    </div>
    [IMAGE:executive-summary]
    <div class="content">
      <!-- Content here with proper paragraphs and formatting -->
    </div>
  </div>
  
  <!-- Quick Wins Section -->
  <div class="card">
    <div class="quick-wins-grid" style="display: grid; gap: 20px;">
      <!-- Each quick win in a styled sub-card -->
      <div class="quick-win-item" style="background: linear-gradient(135deg, #f0feff, #e6fafe); padding: 20px; border-radius: 8px; border-left: 4px solid #08b2c6;">
        <h3>Title</h3>
        <p>Description</p>
        <div class="metrics" style="display: flex; gap: 15px; margin-top: 15px;">
          <span style="background: white; padding: 5px 10px; border-radius: 20px; font-size: 14px;">⏱ Timeframe</span>
          <span style="background: white; padding: 5px 10px; border-radius: 20px; font-size: 14px;">📈 Impact</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- And so on for other sections... -->
</div>

IMPORTANT FORMATTING RULES:
1. Use inline styles (no external CSS classes)
2. Lists should have proper spacing (line-height: 1.8)
3. Include emoji icons for visual appeal (but don't overuse)
4. Create visual hierarchy with font sizes (h1: 36px, h2: 28px, h3: 20px, p: 16px)
5. Add hover effects using style attributes where appropriate
6. Use gradients and shadows to create depth
7. Ensure mobile-responsive design (max-width, padding adjustments)

IMAGE PLACEHOLDERS:
Insert these markers where images should go:
- [IMAGE:executive-summary] - After executive summary header
- [IMAGE:quick-wins] - In quick wins section
- [IMAGE:roadmap] - In strategic roadmap section
- [IMAGE:competitive] - In competitive analysis
- [IMAGE:implementation] - In implementation section

CONTENT FORMATTING:
- Bold key points using <strong> tags
- Use <blockquote> for important callouts with light blue background
- Format lists with proper <ul> and <li> tags
- Add <hr> tags with gradient styling between major sections
- Use tables for comparing options (with alternating row colors)

The HTML should be self-contained and beautiful when rendered, requiring no external CSS.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyInfo, techStack, report } = body;
    
    // Create a focused prompt for HTML generation
    const userPrompt = `Create a beautifully designed HTML report for ${companyInfo?.companyName || 'Test Company'} in the ${companyInfo?.industry || 'technology'} industry.

COMPANY CONTEXT:
- Company: ${companyInfo?.companyName || 'Test Company'}
- Industry: ${companyInfo?.industry || 'Technology'}
- Size: ${companyInfo?.employees || '10-50'} employees
- Biggest Challenge: ${techStack?.biggestChallenge || 'Operational efficiency'}
- Current CRM: ${techStack?.crmSystem || 'None specified'}

REPORT CONTENT TO FORMAT:
${report ? `
Executive Summary: ${report.executiveSummary || 'AI transformation opportunities identified...'}

Quick Wins:
${report.quickWins?.map((qw: any) => `- ${qw.title}: ${qw.description} (${qw.timeframe}, ${qw.impact})`).join('\n')}

Recommendations:
${report.recommendations?.map((rec: any) => `- ${rec.title}: ${rec.description} (ROI: ${rec.roi})`).join('\n')}

Competitive Analysis: ${report.competitiveAnalysis || 'Industry analysis...'}

Next Steps:
${report.nextSteps?.map((step: any) => `- ${step}`).join('\n')}
` : `
Please create sample content that demonstrates your HTML formatting capabilities with:
- An executive summary mentioning their specific challenges
- 3 quick wins with timeframes and impact metrics
- 2-3 strategic recommendations with ROI projections
- Competitive analysis for their industry
- 5 concrete next steps
`}

DESIGN REQUIREMENTS:
1. Create a visually stunning report using the design system provided
2. Include all image placeholder markers ([IMAGE:section-name])
3. Format lists with custom bullets and proper spacing
4. Use gradient headers and call-out boxes
5. Ensure each section is in a styled card
6. Add visual separators between sections
7. Make it mobile-responsive
8. Use inline styles only (no external CSS)

The HTML should be production-ready and beautiful without any additional styling needed.

IMPORTANT: Return the complete HTML as a single string in the htmlReport field, starting with the report-container div.`;

    console.log('[HTML Test] Generating HTML report with GPT-5...');
    
    const result = await callResponses<{ htmlReport: string; sources: any[] }>({
      input: [
        { role: "system", content: HTML_DESIGN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: HtmlReportJsonSchema,
      tools: [{ type: "web_search" }],
      model: process.env.OPENAI_MODEL_REPORT || "gpt-5",
      reasoning_effort: "medium",  // Better for design work
      verbosity: "high"  // More detailed HTML output
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