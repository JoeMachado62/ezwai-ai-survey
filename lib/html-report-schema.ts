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
5. Generate COMPREHENSIVE content - minimum 15,000 characters total
6. Each section should have 3-5 detailed paragraphs
7. ALWAYS use EZWAI contact info, NOT the client's company info

DESIGN SYSTEM:
- Primary: Teal (#08b2c6) with gradients to (#b5feff)
- Accent: Orange (#ff6b35) with gradients to (#ffa947)
- Cards: White with box-shadow: 0 4px 20px rgba(0,0,0,0.1)
- Border-radius: 16px for cards, 8px for elements
- Font: system-ui, -apple-system, sans-serif

HERO SECTION TEMPLATE (USE EXACT TITLES):
<div style="height:400px; background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%), url('[IMAGE:placeholder]'); background-size:cover; background-position:center; display:flex; align-items:flex-end; color:white; padding:48px; border-radius:16px; margin-bottom:32px;">
  <div>
    <div style="font-size:24px; opacity:0.9; margin-bottom:8px;">Section {number}</div>
    <h2 style="font-size:48px; font-weight:bold; margin:0;">{Exact Title from Instructions}</h2>
  </div>
</div>

CRITICAL: Use these EXACT section titles:
- Section 1: "Executive Summary"
- Section 2: "Quick Wins"
- Section 3: "Strategic AI Roadmap"
- Section 4: "Competitive Intelligence"
- Section 5: "Your Implementation Roadmap"
- Section 6: "Next Steps"

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

Generate a complete HTML report with these EXACT sections in this EXACT order with EXACT titles:

1. MAIN HERO: Full-width gradient (teal to orange), company name, "AI Transformation Report"

2. SECTION: "EXECUTIVE SUMMARY"
   - Hero banner with [IMAGE:executive] ONLY
   - Section title must be exactly: "Executive Summary"
   - White card with 4-5 detailed paragraphs
   - Reference their specific challenge
   - Highlight GoHighLevel if applicable
   - Key opportunities summary
   - Industry-specific insights

3. SECTION: "QUICK WINS"
   - Hero banner with [IMAGE:quickwins] ONLY
   - Section title must be exactly: "Quick Wins"
   - 3-4 gradient cards (alternating teal/orange)
   - Each with title, detailed description (2-3 paragraphs), timeframe (2-4 weeks), impact
   - Focus on GoHighLevel solutions first
   - Include specific tools and integrations
   - Estimated time savings or revenue impact

4. SECTION: "STRATEGIC AI ROADMAP"
   - Hero banner with [IMAGE:roadmap] ONLY
   - Section title must be exactly: "Strategic AI Roadmap"
   - White cards with 3-4 detailed long-term strategies
   - Each strategy should have 2-3 paragraphs
   - ROI projections for each
   - Implementation complexity ratings
   - GoHighLevel-centric when applicable

5. SECTION: "COMPETITIVE INTELLIGENCE"
   - Hero banner with [IMAGE:competitive] ONLY
   - Section title must be exactly: "Competitive Intelligence"
   - Research their industry competitors using web search
   - Detailed comparison (3-4 paragraphs)
   - Market positioning opportunities
   - How AI gives competitive advantage

6. SECTION: "YOUR IMPLEMENTATION ROADMAP"
   - Hero banner with [IMAGE:implementation] ONLY
   - Section title must be exactly: "Your Implementation Roadmap"
   - Timeline with 3 phases (Month 1, 2, 3)
   - Specific milestones and deliverables
   - Resource requirements
   - Success metrics

7. SECTION: "NEXT STEPS"
   - Hero banner with [IMAGE:fallback] ONLY
   - Section title must be exactly: "Next Steps"
   - Clear numbered action items (5-7)
   - Start with scheduling consultation
   - Include GoHighLevel demo if relevant
   - Contact information emphasis

8. FINAL CALL TO ACTION (REQUIRED - MUST BE COMPELLING):
   Create a full-width gradient section (teal to orange) with:
   <div style="background:linear-gradient(135deg, #08b2c6, #ff6b35); padding:60px 40px; border-radius:16px; text-align:center; color:white; margin-top:40px;">
     <h2 style="font-size:42px; margin:0 0 20px 0;">Ready to Transform Your Business with AI?</h2>
     <p style="font-size:24px; margin:0 0 30px 0; opacity:0.95;">Schedule Your Free 30-Minute AI Strategy Session</p>
     <div style="background:white; color:#1f2937; padding:30px; border-radius:12px; max-width:600px; margin:0 auto 30px;">
       <h3 style="color:#08b2c6; margin:0 0 20px 0;">In Your Free Consultation, You'll Discover:</h3>
       <ul style="text-align:left; font-size:16px; line-height:1.8;">
         <li>Your top 3 AI opportunities with specific implementation steps</li>
         <li>How to save 10-20 hours per week with automation</li>
         <li>Which AI tools will give you the biggest ROI</li>
         <li>A custom roadmap for your AI transformation</li>
       </ul>
     </div>
     <a href="https://ezwai.com/scheduling-calendar/" style="display:inline-block; background:white; color:#08b2c6; padding:20px 40px; border-radius:8px; text-decoration:none; font-size:20px; font-weight:bold; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
       📅 Schedule Your Free Strategy Session Now
     </a>
     <p style="margin:30px 0 10px 0; font-size:18px;">Or reach out directly:</p>
     <p style="font-size:20px; margin:0;">📧 joe@ezwai.com | 🌐 ezwai.com</p>
     <p style="margin-top:30px; font-size:16px; opacity:0.9; font-style:italic;">
       ⚠️ Don't wait - businesses implementing AI now will dominate their markets in 2025
     </p>
   </div>

9. SOURCES SECTION:
   List all sources at the end in a clean format

IMPORTANT:
- Each section MUST have a UNIQUE hero banner (no duplicate images)
- NO citation artifacts in text
- Professional magazine layout
- Sources listed at the end only
- Use web search for real industry data
- Prioritize GoHighLevel solutions
- Generate MINIMUM 10,000 characters (be comprehensive)
- Include 5+ credible sources
- END with strong CTA to schedule consultation with EZWAI
- Use EZWAI contact (joe@ezwai.com), NOT client's company info

Return the complete HTML wrapped in a container div with proper styling.`;
}