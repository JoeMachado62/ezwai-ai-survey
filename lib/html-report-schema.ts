// HTML Report Schema for production report generation
export const HtmlReportJsonSchema = {
  name: "HtmlReportSchema",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["htmlReport", "sources"],
    properties: {
      htmlReport: { 
        type: "string",
        description: "Complete HTML report with inline styles and magazine layout"
      },
      sources: {
        type: "array",
        minItems: 5,
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

export type HtmlReportResult = {
  htmlReport: string;
  sources: { title: string; url: string }[];
};

// Production HTML generation prompts
export const HTML_SYSTEM_PROMPT = `You are an expert HTML report designer creating magazine-quality AI opportunity reports for businesses.

CRITICAL RULES:
1. NO citation artifacts like [1], [2], etc. in the text
2. NO emoji headers - use proper HTML hero sections
3. Create magazine-style layouts with image overlays
4. Focus on GoHighLevel solutions when applicable

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

CONTENT CARD TEMPLATE:
<div style="background:white; padding:40px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.1); margin-bottom:24px;">
  {content}
</div>

CALLOUT BOX TEMPLATE:
<div style="background:#e0f7ff; border-left:4px solid #08b2c6; padding:24px; margin:24px 0; border-radius:8px;">
  <strong style="color:#08b2c6;">💡 Key Insight:</strong> {insight text}
</div>

QUICK WIN CARD TEMPLATE (alternate teal/orange):
<div style="background:linear-gradient(135deg, #08b2c6, #b5feff); padding:30px; border-radius:12px; margin-bottom:20px; color:white;">
  <h3 style="font-size:24px; margin:0 0 12px 0;">{Quick Win Title}</h3>
  <p style="margin:0 0 16px 0;">{Description}</p>
  <div style="display:flex; gap:12px;">
    <span style="background:rgba(255,255,255,0.2); padding:6px 12px; border-radius:20px; font-size:14px;">⏱ {Timeframe}</span>
    <span style="background:rgba(255,255,255,0.2); padding:6px 12px; border-radius:20px; font-size:14px;">📈 {Impact}</span>
  </div>
</div>

FORMATTING RULES:
- Use hero banners for each major section
- Clean text without citation marks
- Professional typography
- Lists with proper spacing (line-height: 1.8)
- Tables with alternating row colors (#f9fafb)
- No inline citations - sources at the end only`;

export function buildHtmlUserPrompt(
  companyInfo: any,
  techStack: any,
  socialMedia: any,
  aiSummary: string,
  answers: Record<string, any>,
  questions?: any[]
): string {
  // Build survey answers context
  const surveyContext = Object.entries(answers || {}).map(([qKey, a]) => {
    const questionIndex = parseInt(qKey.replace('q_', ''));
    const question = questions?.[questionIndex];
    const questionText = question?.text || qKey;
    
    let answer = Array.isArray(a) ? a : [a];
    
    // Handle "All of the above" selections
    if (answer.some(ans => 
      typeof ans === 'string' && 
      (ans.toLowerCase().includes('all of the above') || 
       ans.toLowerCase().includes('multiple of the above'))
    )) {
      if (question?.options && question.options.length > 0) {
        const allOptions = question.options.filter((opt: string) => 
          !opt.toLowerCase().includes('all of the above') && 
          !opt.toLowerCase().includes('multiple of the above')
        );
        const answerText = answer.join(', ');
        return `Q: ${questionText}\nA: User selected "${answerText}" which means they need help with ALL of these: ${allOptions.join(', ')}`;
      }
    }
    
    const answerText = answer.filter(a => a).join(', ');
    return `Q: ${questionText}\nA: ${answerText}`;
  }).join('\n');

  return `Create a comprehensive magazine-style HTML report for ${companyInfo.companyName}.

==== COMPANY PROFILE ====
Company: ${companyInfo.companyName || 'Not specified'}
Website: ${companyInfo.websiteURL || 'Not provided'}
Industry: ${companyInfo.industry || 'Not specified'}
Size: ${companyInfo.employees || 'Unknown'} employees
Revenue: ${companyInfo.revenue || 'Not disclosed'}

==== CURRENT TECHNOLOGY ====
CRM System: ${techStack.crmSystem || 'None specified'}
AI Tools: ${techStack.aiTools || 'None currently'}
Biggest Challenge: "${techStack.biggestChallenge || 'Not specified'}"

==== MARKETING PROFILE ====
Active Channels: ${socialMedia.channels?.join(', ') || 'None'}
Content Time: ${socialMedia.contentTime || 'Not specified'} per week

==== AI READINESS ASSESSMENT ====
${aiSummary}

==== DETAILED SURVEY RESPONSES ====
${surveyContext}

==== HTML REPORT REQUIREMENTS ====

Generate a complete HTML report with these sections:

1. MAIN HERO: Full-width gradient (teal to orange), company name, "AI Transformation Report"

2. EXECUTIVE SUMMARY:
   - Hero banner with [IMAGE:executive]
   - White card with 2-3 paragraphs
   - Reference their specific challenge
   - Highlight GoHighLevel if applicable
   - Key opportunities summary

3. QUICK WINS (3 items):
   - Hero banner with [IMAGE:quickwins]
   - 3 gradient cards (alternating teal/orange)
   - Each with title, description, timeframe (2-4 weeks), impact
   - Focus on GoHighLevel solutions first
   - Include specific tools and integrations

4. INDUSTRY INSIGHT CALLOUT:
   - Blue callout box about their industry
   - How AI is transforming their sector
   - Competitive advantages available

5. STRATEGIC RECOMMENDATIONS (3-4 items):
   - Hero banner with [IMAGE:recommendations]
   - White cards with detailed strategies
   - ROI projections for each
   - Implementation complexity ratings
   - GoHighLevel-centric when applicable

6. COMPETITIVE ANALYSIS:
   - Hero banner with [IMAGE:competitive]
   - Research their industry competitors
   - Comparison table with alternating rows
   - Market positioning opportunities

7. IMPLEMENTATION ROADMAP:
   - Hero banner with [IMAGE:roadmap]
   - Timeline with 3 phases (Month 1, 2, 3)
   - Specific milestones and deliverables
   - Resource requirements

8. NEXT STEPS:
   - Hero banner with [IMAGE:nextsteps]
   - Numbered action items (5-7)
   - Start with GoHighLevel demo if relevant
   - Contact information callout

IMPORTANT:
- Each section MUST have a hero banner with image overlay
- NO citation artifacts in text
- Professional magazine layout
- Sources listed at the end only
- Use web search for real industry data
- Prioritize GoHighLevel solutions
- Keep HTML under 12,000 characters
- Include 5+ credible sources

Return the complete HTML wrapped in a container div with proper styling.`;
}