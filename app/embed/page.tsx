"use client";
import { useEffect, useMemo, useState } from "react";
import StepCard from "@/components/StepCard";
import { TextField, TextArea, SelectField } from "@/components/Field";
import LoadingDots from "@/components/LoadingDots";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { QuestionsResult, GeneratedQuestion, ReportResult, QuestionsInput } from "@/lib/schemas";

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

  async function downloadPdf() {
    if (!report) return;
    try {
      const response = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          report, 
          companyName: companyInfo.companyName 
        })
      });
      
      if (!response.ok) {
        alert("Could not generate PDF.");
        return;
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AI_Opportunities_${companyInfo.companyName || "Report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Could not download PDF.");
      console.error(error);
    }
  }

  async function saveToGHL() {
    setLoading(true);
    try {
      const response = await fetch("/api/ghl/contact", {
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
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "GHL error");
      }
      
      setStep(4);
    } catch (error: any) {
      alert(error.message || "Could not save to CRM.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-6">
      <LoadingOverlay show={loading} phase={loadingPhase} companyInfo={companyInfo} />

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
            <button className="btn-ez" onClick={() => setStep(2)} disabled={loading}>
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
              onClick={saveToGHL} 
              disabled={loading || !firstName || !lastName || !email}
            >
              {loading ? <LoadingDots/> : "Get My AI Report"}
            </button>
          </div>
          
          <p className="small-text">
            By submitting your information, you agree to receive your personalized AI opportunities report and follow-up consultation. 
            We respect your privacy and will never share your information with third parties.
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
        <StepCard title="Success! Your AI Report is Ready" subtitle="Your personalized AI opportunities assessment has been saved">
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
            <button className="btn-ez" onClick={downloadPdf} disabled={!report || loading}>
              Download Report as PDF
            </button>
          </div>
          
          <p className="text-sm text-slate-600 mt-4">Thank you! Our team will reach out with personalized guidance on implementing these recommendations.</p>
        </StepCard>
      )}
    </main>
  );
}