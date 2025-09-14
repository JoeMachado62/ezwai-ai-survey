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

const HTML_DESIGN_SYSTEM_PROMPT = `Generate a magazine-style HTML report with these EXACT design elements:

COLORS:
- Teal gradient: linear-gradient(135deg, #08b2c6, #b5feff)
- Orange gradient: linear-gradient(135deg, #ff6b35, #ffa947)
- Purple accent: #7c3aed
- Background: #f9fafb

MAGAZINE STYLING RULES:
1. Hero section with teal-to-orange gradient
2. White cards with box-shadow: 0 4px 20px rgba(0,0,0,0.1)
3. Section headers with gradient backgrounds
4. Call-out boxes with light blue background (#e0f7ff) and left border
5. Quick wins in gradient cards (alternating teal/orange)
6. Metrics badges with colored backgrounds
7. Use emojis strategically (📊 📈 🎯 ⚡ 🚀 ✓)

HTML STRUCTURE EXAMPLE:
<div style="background:#f9fafb; padding:20px; font-family:system-ui">
  <div style="background:linear-gradient(135deg,#08b2c6,#ff6b35); padding:50px; border-radius:20px; color:white; text-align:center">
    <h1 style="font-size:42px; margin:0">AI Report</h1>
  </div>
  
  <div style="background:white; margin:30px 0; padding:40px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.1)">
    <div style="background:linear-gradient(90deg,#08b2c6,transparent); margin:-40px -40px 30px; padding:20px 40px; border-radius:16px 16px 0 0">
      <h2 style="color:white; margin:0">Section Title</h2>
    </div>
    [IMAGE:section]
    Content...
  </div>
  
  <div style="background:#e0f7ff; border-left:4px solid #08b2c6; padding:20px; margin:20px 0; border-radius:8px">
    <strong>💡 Key Insight:</strong> Call-out box content
  </div>
</div>`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyInfo, techStack, report } = body;
    
    const userPrompt = `Create magazine-style HTML report for ${companyInfo?.companyName || 'Test Company'} (${companyInfo?.industry || 'technology'}).

REQUIRED SECTIONS WITH STYLING:

1. HERO: Gradient background (teal to orange), company name, "AI Transformation Report"

2. EXECUTIVE SUMMARY: White card, gradient header, [IMAGE:executive], 2 paragraphs about ${techStack?.biggestChallenge || 'challenges'}

3. QUICK WINS (2 items):
   - Card 1: Teal gradient background
   - Card 2: Orange gradient background
   - Include: 🎯 title, description, ⏱ timeframe badge, 📈 impact badge

4. CALL-OUT BOX: Light blue background (#e0f7ff), left border, "💡 Key Insight" about their industry

5. RECOMMENDATIONS: White card with purple accents, 2 items with ROI metrics

6. COMPETITIVE ANALYSIS: Include comparison table with alternating row colors

7. NEXT STEPS: Numbered list with gradient bullets

STYLING MUST-HAVES:
- Gradients on headers and hero
- Box shadows on all cards
- Border-radius: 16px for cards, 8px for buttons
- Emojis for visual appeal
- Alternating colors for items
- [IMAGE:section] placeholders

Keep concise but visually rich. Use exact colors and gradients specified.`;

    console.log('[HTML Test] Generating HTML report with GPT-5...');
    
    const result = await callResponses<{ htmlReport: string; sources: any[] }>({
      input: [
        { role: "system", content: HTML_DESIGN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      schema: HtmlReportJsonSchema,
      tools: [],  // Disable web search for faster response
      model: "gpt-5-mini",  // Use faster model for HTML generation
      reasoning_effort: "low",  // Balanced for better styling
      verbosity: "medium"  // More detailed HTML output
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