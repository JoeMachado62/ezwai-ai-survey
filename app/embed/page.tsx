"use client";
import { useEffect, useMemo, useState } from "react";
import StepCard from "@/components/StepCard";
import { TextField, TextArea, SelectField } from "@/components/Field";
import LoadingDots from "@/components/LoadingDots";
import LoadingOverlay from "@/components/LoadingOverlay";
import EnhancedReport from "@/components/report/EnhancedReport";
import LoadingSpinner from "@/components/report/LoadingSpinner";
import type { QuestionsResult, GeneratedQuestion, ReportResult, QuestionsInput } from "@/lib/schemas";
import type { ReportSection } from "@/lib/report-types";

// Images from original design
const images = {
  intro: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68baffc29846a685cc4f2bb2.webp",
  techStack: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg",
  social: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb04c89846a6c43e4fd338.webp",
  questions1: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91bb03232c933f450f.jpeg",
  questions2: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91cac6682b0fc37eeb.jpeg",
  finalCta: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d8f398f0686b47096.jpeg"
};

// Testimonials data
const testimonials = [
  {
    text: "The AI assessment identified 12 automation opportunities we hadn't considered. We've already implemented 3 and saved 20 hours per week.",
    author: "James Miller",
    role: "Operations Director",
    initial: "JM"
  },
  {
    text: "We replaced 5 different tools with one AI-powered system that integrates with our existing CRM. Efficiency increased by 40%.",
    author: "Sarah Kim",
    role: "Tech Startup Founder",
    initial: "SK"
  },
  {
    text: "AI now creates 80% of our social media content. We went from posting twice a week to daily, and engagement tripled.",
    author: "Rachel Thompson",
    role: "Marketing Manager",
    initial: "RT"
  }
];

// Testimonial Component
function Testimonial({ text, author, role, initial }: typeof testimonials[0]) {
  return (
    <div className="testimonial">
      <div className="testimonial-text">{text}</div>
      <div className="testimonial-author">
        <div className="profile-image">{initial}</div>
        <span>- {author}, {role}</span>
      </div>
    </div>
  );
}

// Image Header Component  
function ImageHeader({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="image-container">
      <div className="image-shadow"></div>
      <div className="image-frame">
        <img src={src} alt={alt} />
      </div>
    </div>
  );
}

export default function Embed() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"questions" | "report" | undefined>();

  const [companyInfo, setCompanyInfo] = useState<QuestionsInput["companyInfo"]>({ 
    companyName: "", 
    websiteURL: "", 
    industry: "", 
    employees: "", 
    revenue: "" 
  });
  
  const [techStack, setTechStack] = useState<QuestionsInput["techStack"]>({ 
    crmSystem: "", 
    aiTools: "", 
    biggestChallenge: "" 
  });
  
  const [socialMedia, setSocialMedia] = useState<QuestionsInput["socialMedia"]>({ 
    channels: [], 
    contentTime: "" 
  });

  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [summary, setSummary] = useState("");
  const [qSources, setQSources] = useState<{title: string; url: string}[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [report, setReport] = useState<ReportResult | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Enhanced report state
  const [enhancedReport, setEnhancedReport] = useState<ReportSection[] | null>(null);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);

  // Auto-resize iframe
  useEffect(() => {
    const send = () => {
      const h = document.documentElement.scrollHeight;
      window.parent?.postMessage({ type: "EZWAI_IFRAME_HEIGHT", height: h }, "*");
    };
    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.documentElement);
    window.addEventListener("load", send);
    return () => { 
      ro.disconnect(); 
      window.removeEventListener("load", send); 
    };
  }, []);

  const grouped = useMemo(() => {
    const half = Math.ceil(questions.length / 2);
    return [questions.slice(0, half), questions.slice(half)];
  }, [questions]);

  async function generateQuestions() {
    setLoading(true);
    setLoadingPhase("questions");
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyInfo, techStack, socialMedia })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const data: QuestionsResult = await response.json();
      setSummary(data.summary);
      setQuestions(data.questions);
      setQSources(data.sources || []);
      setStep(1);
    } catch (error) {
      alert("Could not generate dynamic questions. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingPhase(undefined);
    }
  }

  function renderQuestion(q: GeneratedQuestion, idx: number) {
    const key = `q_${idx}`;
    if (q.type === "multiple_choice" && q.options?.length) {
      return (
        <SelectField 
          key={key} 
          label={q.text} 
          value={answers[key] || ""} 
          onChange={e => setAnswers(a => ({ ...a, [key]: e.target.value }))}
        >
          <option value="" disabled>Choose an option</option>
          {q.options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </SelectField>
      );
    }
    return (
      <TextArea 
        key={key} 
        label={q.text} 
        value={answers[key] || ""} 
        onChange={e => setAnswers(a => ({ ...a, [key]: e.target.value }))} 
      />
    );
  }

  async function buildReport() {
    setLoading(true);
    setLoadingPhase("report");
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          companyInfo, 
          techStack, 
          socialMedia, 
          aiSummary: summary, 
          answers 
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const data: ReportResult = await response.json();
      setReport(data);
      setStep(3);
    } catch (error) {
      alert("Could not finalize the report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingPhase(undefined);
    }
  }

  // Simple text download for fallback mode
  function downloadTextReport() {
    if (!report) return;
    
    const textContent = `
AI OPPORTUNITIES REPORT
Prepared for: ${companyInfo.companyName}

` +
      `EXECUTIVE SUMMARY\n${report.executiveSummary}\n\n` +
      `QUICK WINS\n${report.quickWins.map(w => `- ${w.title}: ${w.description}`).join('\n')}\n\n` +
      `RECOMMENDATIONS\n${report.recommendations.map(r => `- ${r.title}: ${r.description}`).join('\n')}\n\n` +
      `COMPETITIVE ANALYSIS\n${report.competitiveAnalysis}\n\n` +
      `NEXT STEPS\n${report.nextSteps.join('\n')}\n`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Report_${companyInfo.companyName || 'Your_Business'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Transform ReportResult to ReportSection[] format
  function transformReportToSections(report: ReportResult): Omit<ReportSection, 'imageUrl'>[] {
    const sections: Omit<ReportSection, 'imageUrl'>[] = [];
    
    // Executive Summary section
    sections.push({
      title: "Executive Summary",
      mainContent: report.executiveSummary,
      imagePrompt: `Create a professional, abstract business visualization representing AI transformation opportunities for a ${companyInfo.industry} company. Use modern, tech-inspired design with subtle blue and teal gradients.`,
      pullQuote: "Your AI transformation journey starts here",
      keyTakeaways: [
        `Tailored for ${companyInfo.companyName}`,
        `${report.quickWins.length} immediate opportunities identified`,
        `Industry-specific recommendations`
      ]
    });
    
    // Quick Wins section
    if (report.quickWins.length > 0) {
      sections.push({
        title: "Quick Wins - 30 Day Implementation",
        mainContent: report.quickWins.map(win => 
          `**${win.title}**\n${win.description}\n*Timeframe: ${win.timeframe} | Impact: ${win.impact}*`
        ).join('\n\n'),
        imagePrompt: `Illustrate quick, achievable AI implementations with upward trending graphs and checkmarks. Modern business style with orange accents for urgency and action.`,
        statistic: {
          value: `${report.quickWins.length}`,
          description: "Immediate AI opportunities"
        },
        keyTakeaways: report.quickWins.map(win => win.title)
      });
    }
    
    // Strategic Recommendations section
    if (report.recommendations.length > 0) {
      sections.push({
        title: "Strategic AI Roadmap",
        mainContent: report.recommendations.map(rec => 
          `**${rec.title}**\n${rec.description}\n*Expected ROI: ${rec.roi}*`
        ).join('\n\n'),
        imagePrompt: `Design a futuristic roadmap visualization showing AI integration phases, with interconnected nodes and a pathway to digital transformation. Use professional blue tones.`,
        pullQuote: report.recommendations[0]?.roi || "Significant ROI potential",
        keyTakeaways: report.recommendations.map(rec => rec.title)
      });
    }
    
    // Competitive Analysis section
    sections.push({
      title: "Competitive Intelligence",
      mainContent: report.competitiveAnalysis,
      imagePrompt: `Create a competitive landscape visualization with abstract representations of market positioning and AI adoption levels. Use data-driven design elements with teal highlights.`,
      statistic: {
        value: "20-40%",
        description: "Average efficiency gain from AI adoption"
      }
    });
    
    // Next Steps section
    sections.push({
      title: "Your Implementation Roadmap",
      mainContent: "Here's your personalized action plan:\n\n" + report.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n'),
      imagePrompt: `Illustrate a clear action plan with numbered steps ascending like stairs, leading to a bright, tech-enabled future. Professional style with EZWAI brand colors.`,
      keyTakeaways: report.nextSteps.slice(0, 3)
    });
    
    return sections;
  }
  
  
  async function processContactAndGenerateVisualReport() {
    if (!report) {
      alert('Report data is missing. Please try again.');
      return;
    }
    
    setLoading(true);
    setLoadingPhase('report' as any);
    
    try {
      // Step 1: Save contact to GHL (non-blocking - we'll continue even if this fails)
      try {
        const ghlResponse = await fetch("/api/ghl/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            tags: ["AI Assessment Survey", companyInfo.industry].filter(Boolean),
            companyInfo,
            techStack,
            socialMedia,
            answers,
            report
          })
        });
        
        if (!ghlResponse.ok) {
          console.error('GHL save failed but continuing with report generation');
        }
      } catch (ghlError) {
        console.error('GHL contact save error (non-fatal):', ghlError);
        // Continue with report generation even if GHL fails
      }
      
      // Step 2: Transform and generate enhanced visual report
      setIsGeneratingVisuals(true);
      const reportSections = transformReportToSections(report);
      
      // Step 3: Call image generation API
      const imageResponse = await fetch('/api/report/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData: reportSections })
      });
      
      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.error || 'Failed to generate visual report');
      }
      
      const imageData = await imageResponse.json();
      setEnhancedReport(imageData.enhancedReport);
      
      // Success - show the enhanced report
      setStep(5);
      
    } catch (error: any) {
      console.error('Visual report generation error:', error);
      // Fallback to basic text report if visual generation fails
      alert('Using text-only report view. Visual enhancements unavailable.');
      setStep(4);
    } finally {
      setLoading(false);
      setLoadingPhase(undefined);
      setIsGeneratingVisuals(false);
    }
  }

  // Handle closing the enhanced report and starting over
  const handleCloseReport = () => {
    // Reset all state to start fresh
    setStep(0);
    setEnhancedReport(null);
    setReport(null);
    setAnswers({});
    setQuestions([]);
    setSummary("");
    setQSources([]);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCompanyInfo({ 
      companyName: "", 
      websiteURL: "", 
      industry: "", 
      employees: "", 
      revenue: "" 
    });
    setTechStack({ 
      crmSystem: "", 
      aiTools: "", 
      biggestChallenge: "" 
    });
    setSocialMedia({ 
      channels: [], 
      contentTime: "" 
    });
  };
  
  // Show loading spinner during visual generation
  if (isGeneratingVisuals && !loading) {
    return <LoadingSpinner />;
  }
  
  // Show enhanced report if available
  if (enhancedReport && step === 5) {
    return (
      <EnhancedReport 
        sections={enhancedReport}
        businessName={companyInfo.companyName || 'Your Business'}
        onClose={handleCloseReport}
      />
    );
  }
  
  return (
    <main className="container">
      <LoadingOverlay show={loading || isGeneratingVisuals} phase={isGeneratingVisuals ? 'report' : loadingPhase} companyInfo={companyInfo} />

      {step === 0 && (
        <StepCard title="Let's Understand Your Business" subtitle="Tell us about your company to receive a customized AI opportunities assessment">
          <ImageHeader src={images.intro} alt="AI Introduction" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField 
              label="Company Name" 
              value={companyInfo.companyName} 
              onChange={e => setCompanyInfo({ ...companyInfo, companyName: e.target.value })} 
              required 
            />
            <TextField 
              label="Website URL" 
              value={companyInfo.websiteURL || ""} 
              onChange={e => setCompanyInfo({ ...companyInfo, websiteURL: e.target.value })} 
              placeholder="https://example.com" 
            />
            <TextField 
              label="Industry" 
              value={companyInfo.industry} 
              onChange={e => setCompanyInfo({ ...companyInfo, industry: e.target.value })} 
              required 
            />
            <TextField 
              label="Employees" 
              value={companyInfo.employees || ""} 
              onChange={e => setCompanyInfo({ ...companyInfo, employees: e.target.value })} 
            />
            <SelectField 
              label="Annual Revenue" 
              value={companyInfo.revenue || ""} 
              onChange={e => setCompanyInfo({ ...companyInfo, revenue: e.target.value })}
            >
              <option value="" disabled>Select range</option>
              <option value="Under $100k">Under $100k</option>
              <option value="$100k-$250k">$100k - $250k</option>
              <option value="$250k-$500k">$250k - $500k</option>
              <option value="$500k-$1M">$500k - $1M</option>
              <option value="$1M-$5M">$1M - $5M</option>
              <option value="$5M-$10M">$5M - $10M</option>
              <option value="$10M-$25M">$10M - $25M</option>
              <option value="Over $25M">Over $25M</option>
            </SelectField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <TextField 
              label="CRM (if any)" 
              value={techStack.crmSystem || ""} 
              onChange={e => setTechStack({ ...techStack, crmSystem: e.target.value })} 
            />
            <TextField 
              label="AI Tools Currently Used" 
              value={techStack.aiTools || ""} 
              onChange={e => setTechStack({ ...techStack, aiTools: e.target.value })} 
            />
          </div>
          
          <TextArea 
            label="Biggest Challenge" 
            value={techStack.biggestChallenge || ""} 
            onChange={e => setTechStack({ ...techStack, biggestChallenge: e.target.value })} 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <TextField 
              label="Social Channels (comma-separated)" 
              value={(socialMedia.channels || []).join(", ")} 
              onChange={e => setSocialMedia({ 
                ...socialMedia, 
                channels: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
              })} 
            />
            <TextField 
              label="Weekly Content Time" 
              value={socialMedia.contentTime || ""} 
              onChange={e => setSocialMedia({ ...socialMedia, contentTime: e.target.value })} 
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button 
              className="btn-ez" 
              onClick={generateQuestions} 
              disabled={loading || !companyInfo.companyName || !companyInfo.industry}
            >
              {loading ? <LoadingDots/> : "Continue"}
            </button>
          </div>
          
          <Testimonial {...testimonials[0]} />
        </StepCard>
      )}

      {step === 1 && (
        <StepCard 
          title="Personalized Questions for Your Business" 
          subtitle={summary ? summary : "Based on our analysis, we've identified key areas to explore"}
        >
          <ImageHeader src={images.questions1} alt="Dynamic Questions" />
          {qSources?.length ? (
            <div className="mb-4 text-sm text-slate-600">
              <div className="font-semibold">Sources</div>
              <ul className="list-disc ml-5">
                {qSources.map((s, i) => (
                  <li key={i}>
                    <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          
          {grouped[0].map(renderQuestion)}
          
          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => setStep(0)} disabled={loading}>
              Back
            </button>
            <button className="btn-ez" onClick={() => {
              // Validate that at least half the questions are answered
              const answeredCount = Object.keys(answers).filter(key => answers[key]?.trim()).length;
              if (answeredCount < Math.floor(questions.length / 2)) {
                alert(`Please answer at least ${Math.floor(questions.length / 2)} questions to continue.`);
                return;
              }
              setStep(2);
            }} disabled={loading}>
              Continue
            </button>
          </div>
          
          <Testimonial {...testimonials[1]} />
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="Let's Dive Deeper Into Your Processes" subtitle="These questions help us calculate your potential ROI from AI implementation">
          <ImageHeader src={images.questions2} alt="Process Deep Dive" />
          
          {grouped[1].map(renderQuestion)}
          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => setStep(1)} disabled={loading}>
              Back
            </button>
            <button className="btn-ez" onClick={buildReport} disabled={loading}>
              {loading ? <LoadingDots/> : "Generate My Report"}
            </button>
          </div>
          
          <Testimonial {...testimonials[2]} />
        </StepCard>
      )}

      {step === 3 && report && (
        <StepCard title="Your AI Transformation Report is Ready!" subtitle="Enter your contact information to receive your personalized AI opportunities report">
          <ImageHeader src={images.finalCta} alt="Final Call to Action" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField 
              label="First Name" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
              required 
            />
            <TextField 
              label="Last Name" 
              value={lastName} 
              onChange={e => setLastName(e.target.value)} 
              required 
            />
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <TextField 
              label="Phone" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => setStep(2)} disabled={loading}>
              Back
            </button>
            <button 
              className="btn-ez" 
              onClick={processContactAndGenerateVisualReport} 
              disabled={loading || !firstName || !lastName || !email}
            >
              {loading ? <LoadingDots/> : "Generate My Visual AI Report"}
            </button>
          </div>
          
          <p className="small-text">
            By clicking the button above, you'll receive a visually enhanced AI report with custom-generated imagery. 
            We'll also save your contact for follow-up consultation. Your privacy is protected.
          </p>

          {report.sources?.length ? (
            <div className="mt-6 text-sm text-slate-600">
              <div className="font-semibold">Report Sources</div>
              <ul className="list-disc ml-5">
                {report.sources.map((s, i) => (
                  <li key={i}>
                    <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </StepCard>
      )}

      {step === 4 && (
        <StepCard title="Text Report Ready (Fallback Mode)" subtitle="Visual generation unavailable - showing text version">
          <div className="report-section">
            <div className="report-header">
              <div className="report-title">AI Opportunities Report</div>
              <div className="report-subtitle">Prepared for {companyInfo.companyName}</div>
            </div>
            
            {report && (
              <div className="report-content">
                <div className="report-section-title">Executive Summary</div>
                <div className="report-item">
                  <div className="report-item-description">{report.executiveSummary}</div>
                </div>
                
                <div className="report-section-title">Quick Wins - Implement Within 30 Days</div>
                {report.quickWins.map((win, i) => (
                  <div key={i} className="report-item">
                    <div className="report-item-title">{win.title}</div>
                    <div className="report-item-description">
                      {win.description}<br/>
                      <strong>Timeframe:</strong> {win.timeframe}<br/>
                      <strong>Impact:</strong> {win.impact}
                    </div>
                  </div>
                ))}
                
                <div className="report-section-title">Strategic Recommendations</div>
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="report-item">
                    <div className="report-item-title">{rec.title}</div>
                    <div className="report-item-description">
                      {rec.description}<br/>
                      <strong>Expected ROI:</strong> {rec.roi}
                    </div>
                  </div>
                ))}
                
                <div className="report-section-title">Competitive Analysis</div>
                <div className="report-item">
                  <div className="report-item-description">{report.competitiveAnalysis}</div>
                </div>
                
                <div className="report-section-title">Your Next Steps</div>
                <div className="report-item">
                  <div className="report-item-description">
                    <ol>
                      {report.nextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => {
              setStep(3);
              setEnhancedReport(null);
            }}>
              Try Again
            </button>
            <button className="btn-ez" onClick={downloadTextReport} disabled={!report}>
              Download Text Report
            </button>
          </div>
          
          <p className="text-sm text-slate-600 mt-4">
            Note: Visual enhancements couldn't be generated. You can download the text version above or try again.
          </p>
        </StepCard>
      )}
    </main>
  );
}