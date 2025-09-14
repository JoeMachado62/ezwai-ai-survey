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

const HTML_DESIGN_SYSTEM_PROMPT = `Generate a simple HTML report with inline styles. Use teal (#08b2c6) as accent color, white cards with shadows, clean fonts. Include sections for Executive Summary, Quick Wins, Recommendations, Competitive Analysis, and Next Steps. Add [IMAGE:section-name] placeholders. Keep it simple and clean.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyInfo, techStack, report } = body;
    
    const userPrompt = `Create HTML report for ${companyInfo?.companyName || 'Test Company'} (${companyInfo?.industry || 'technology'} industry, ${companyInfo?.employees || '10-50'} employees).

Challenge: ${techStack?.biggestChallenge || 'Operational efficiency'}

Generate 5 sections with sample content:
1. Executive Summary (1 paragraph)
2. Quick Wins (2 items with timeframe)
3. Recommendations (2 items with ROI)
4. Competitive Analysis (1 paragraph)
5. Next Steps (3 action items)

Use inline styles, teal accents, white cards. Add [IMAGE:section] placeholders. Keep HTML under 3000 characters total.`;

    console.log('[HTML Test] Generating HTML report with GPT-5...');
    
    const result = await callResponses<{ htmlReport: string; sources: any[] }>({
      input: [
        { role: "system", content: HTML_DESIGN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: HtmlReportJsonSchema,
      tools: [],  // Disable web search for faster response
      model: "gpt-5-mini",  // Use faster model for HTML generation
      reasoning_effort: "minimal",  // Fastest processing
      verbosity: "low"  // Concise output
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