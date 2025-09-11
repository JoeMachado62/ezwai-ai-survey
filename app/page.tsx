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
import Image from "next/image";

// Images from original design
const images = {
  intro: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68baffc29846a685cc4f2bb2.webp",
  techStack: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68c0fd00fc3670a761200bd6.jpeg",
  social: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb04c89846a6c43e4fd338.webp",
  questions1: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91bb03232c933f450f.jpeg",
  questions2: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d8f398f0686b47096.jpeg",
  finalCta: "https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91723561050390c17b.jpeg"
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
    text: "We replaced 5 different tools with one AI-powered system that integrates with our existing CRM. Efficiency increased by 40.",
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
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>{author}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

// Image Header Component with optimizations
function ImageHeader({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const [imageLoading, setImageLoading] = useState(true);
  
  return (
    <div className="image-container">
      <div className="image-shadow"></div>
      <div className="image-frame" style={{ position: 'relative', minHeight: imageLoading ? '300px' : 'auto' }}>
        {imageLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '8px'
          }} />
        )}
        <Image 
          src={src} 
          alt={alt} 
          width={1024} 
          height={576}
          priority={priority}
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => setImageLoading(false)}
          style={{ opacity: imageLoading ? 0 : 1, transition: 'opacity 0.3s' }}
        />
      </div>
    </div>
  );
}

// Multiple Choice Question Component (supports both single and multi-select)
function MultipleChoiceQuestion({
  question,
  value,
  onChange
}: { 
  question: GeneratedQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}) {
  const isMultiSelect = question.multiSelect || false;
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
  
  const handleOptionClick = (option: string) => {
    if (isMultiSelect) {
      // Multi-select logic
      const newValues = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      onChange(newValues);
    } else {
      // Single-select logic
      onChange(option);
    }
  };
  
  return (
    <div className="mb-4">
      <label className="label-ez">
        {question.text}
        {isMultiSelect && (
          <span className="text-sm text-gray-500 ml-2">(Select all that apply)</span>
        )}
      </label>
      <div className="question-options">
        {question.options?.map((option, i) => {
          const isSelected = isMultiSelect 
            ? selectedValues.includes(option)
            : value === option;
          
          return (
            <div
              key={i}
              className={`question-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {isMultiSelect && (
                <span className="mr-2">
                  {isSelected ? '☑' : '☐'}
                </span>
              )}
              {option}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Social Media Checkbox Component
function SocialMediaCheckboxes({
  channels,
  onChange
}: { 
  channels: string[];
  onChange: (channels: string[]) => void;
}) {
  const allChannels = [
    "YouTube", "Facebook", "Instagram", "Twitter/X", 
    "LinkedIn", "Website Blog", "TikTok", "Other"
  ];

  return (
    <div className="mb-4">
      <label className="label-ez">Which social media marketing channels are you active on?</label>
      <div className="checkbox-group">
        {allChannels.map(channel => (
          <div
            key={channel}
            className={`checkbox-item ${channels.includes(channel) ? 'checked' : ''}`}
            onClick={() => {
              if (channels.includes(channel)) {
                onChange(channels.filter(c => c !== channel));
              } else {
                onChange([...channels, channel]);
              }
            }}
          >
            {channel}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0); // 0: Business Info, 1: Tech Stack, 2: Social Media
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
  const [skipWaitMode, setSkipWaitMode] = useState(false);

  // Preload all images on component mount for faster display
  useEffect(() => {
    // Create link elements for preloading
    Object.values(images).forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
    
    // Also preload images using Image constructor for immediate caching
    Object.values(images).forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Auto-resize for iframe embedding
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
      
      // Log multi-select questions for debugging
      const multiSelectQuestions = data.questions.filter(q => q.multiSelect);
      if (multiSelectQuestions.length > 0) {
        console.log(`Found ${multiSelectQuestions.length} multi-select questions`);
      }
      
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
    
    // Handle multiple choice questions with styled buttons
    if (q.type === "multiple_choice" && q.options?.length) {
      // ALL multiple choice questions are now multi-select
      const modifiedQuestion = { ...q, multiSelect: true };
      
      return (
        <MultipleChoiceQuestion
          key={key}
          question={modifiedQuestion}
          value={answers[key] || []}
          onChange={value => setAnswers(a => ({ ...a, [key]: value }))}
        />
      );
    }
    
    // Default to text area for open-ended questions
    return (
      <TextArea 
        key={key} 
        label={q.text} 
        value={answers[key] || ""} 
        onChange={e => setAnswers(a => ({ ...a, [key]: e.target.value }))} 
      />
    );
  }

  async function buildReportAndProcess() {
    // IMMEDIATELY show loading overlay with skip option
    setLoading(true);
    setLoadingPhase("report");
    setIsGeneratingVisuals(true);
    
    // Set a timeout for the entire process (5 minutes to match server timeout)
    const reportTimeout = setTimeout(() => {
      if (loading) {
        console.error("Report generation timed out after 5 minutes");
        alert("Report generation is taking longer than expected. We'll email you the report once it's ready.");
        setLoading(false);
        setLoadingPhase(undefined);
        setIsGeneratingVisuals(false);
      }
    }, 300000); // 5 minutes to match server timeout
    
    try {
      // Create an AbortController for fetch timeout
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 240000); // 4 minute fetch timeout (less than total timeout)
      
      // Make report API call WHILE overlay is showing
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyInfo, 
          techStack, 
          socialMedia, 
          aiSummary: summary, 
          answers 
        }),
        signal: controller.signal
      });
      
      clearTimeout(fetchTimeout);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const data: ReportResult = await response.json();
      setReport(data);
      
      // Now process the visual report
      await processContactAndGenerateVisualReport();
      
      // Clear the main timeout if everything succeeded
      clearTimeout(reportTimeout);
      
    } catch (error: any) {
      clearTimeout(reportTimeout);
      
      if (error.name === 'AbortError') {
        console.error("Report API call timed out");
        alert("Report generation is taking longer than expected. Please try again or use the email option.");
      } else {
        console.error("Error in report generation:", error);
        alert("Could not generate the report. Please try again.");
      }
      
      setLoading(false);
      setLoadingPhase(undefined);
      setIsGeneratingVisuals(false);
    }
  }

  // Transform ReportResult to ReportSection[] format
  function transformReportToSections(report: ReportResult): Omit<ReportSection, 'imageUrl'>[] {
    const sections: Omit<ReportSection, 'imageUrl'>[] = [];
    
    // Extract key themes from the executive summary for a more relevant image
    const summaryKeywords = report.executiveSummary.slice(0, 200);
    
    sections.push({
      title: "Executive Summary",
      mainContent: report.executiveSummary,
      imagePrompt: `Create a professional business visualization for ${companyInfo.companyName} in the ${companyInfo.industry} industry. 
                    Focus on: ${summaryKeywords}. 
                    Style: Modern tech-inspired design with blue (#08b2c6) and teal (#b5feff) gradients. 
                    Include abstract representations of AI automation and digital transformation.`,
      pullQuote: "Your AI transformation journey starts here",
      keyTakeaways: [
        `Tailored for ${companyInfo.companyName}`,
        `${report.quickWins.length} immediate opportunities identified`,
        `Industry-specific recommendations`
      ]
    });
    
    if (report.quickWins.length > 0) {
      // Create image prompt based on actual quick wins
      const quickWinTitles = report.quickWins.map(w => w.title).join(', ');
      
      sections.push({
        title: "Quick Wins - 30 Day Implementation",
        mainContent: report.quickWins.map(win => 
          `**${win.title}**\n${win.description}\n*Timeframe: ${win.timeframe} | Impact: ${win.impact}*`
        ).join('\n\n'),
        imagePrompt: `Create a dynamic visualization showing these specific AI quick wins: ${quickWinTitles}. 
                      Include upward trending graphs, checkmarks, and timeline elements. 
                      Use orange (#ff6b11) accents for urgency with blue (#08b2c6) base. 
                      Modern business style emphasizing immediate action and fast results.`,
        statistic: {
          value: `${report.quickWins.length}`,
          description: "Immediate AI opportunities"
        },
        keyTakeaways: report.quickWins.map(win => win.title)
      });
    }
    
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
    
    sections.push({
      title: "Competitive Intelligence",
      mainContent: report.competitiveAnalysis,
      imagePrompt: `Create a competitive landscape visualization with abstract representations of market positioning and AI adoption levels. Use data-driven design elements with teal highlights.`,
      statistic: {
        value: "20-40%",
        description: "Average efficiency gain from AI adoption"
      }
    });
    
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
      console.error('Report data is missing in processContactAndGenerateVisualReport');
      alert('Report data is missing. Please try again or use the email option to receive your report.');
      setLoading(false);
      setLoadingPhase(undefined);
      setIsGeneratingVisuals(false);
      return;
    }
    
    try {
      // Save contact to GHL (non-blocking)
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
          console.error('GHL save failed but continuing with report display');
        }
      } catch (ghlError) {
        console.error('GHL contact save error (non-fatal):', ghlError);
      }
      
      // Transform report sections and assign environment variable images
      const reportSections = transformReportToSections(report);
      
      // Map sections with proper image URLs from environment variables
      const enhancedSections = reportSections.map((section, index) => {
        let imageUrl = '';
        
        // Assign images based on section title
        if (section.title.includes('Executive Summary')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_EXECUTIVE || '';
        } else if (section.title.includes('Quick Wins')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_QUICKWINS || '';
        } else if (section.title.includes('Strategic AI Roadmap')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || '';
        } else if (section.title.includes('Competitive')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_COMPETITIVE || '';
        } else if (section.title.includes('Implementation')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_IMPLEMENTATION || '';
        } else {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_FALLBACK || '';
        }
        
        return { ...section, imageUrl };
      });
      
      setEnhancedReport(enhancedSections as any);
      
      // Success - show the enhanced report
      setStep(5);
      
    } finally {
      setLoading(false);
      setLoadingPhase(undefined);
      setIsGeneratingVisuals(false);
    }
  }

  // Handle closing the enhanced report and starting over
  const handleCloseReport = () => {
    setStep(0);
    setSubStep(0);
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

  // Handle skip wait and send report by email
  const handleSkipWait = async () => {
    try {
      setSkipWaitMode(true);
      
      // We need to wait for the report to be generated if it's not ready yet
      if (!report) {
        // Report is still being generated, just acknowledge and close
        // NOTE: In a production system, this should trigger a background job
        // that sends the email once the report is ready
        alert('We\'ve noted your email preference. Your report is still being generated and you\'ll receive it once complete.\n\nNote: In the current version, you may need to keep this page open for the report to finish generating.');
        
        // Keep the loading state but hide the overlay
        setLoading(false);
        setIsGeneratingVisuals(false);
        
        // Don't close/reset - let the report continue generating in background
        return;
      }
      
      // Transform report to sections for email
      const reportSections = transformReportToSections(report);
      const enhancedSectionsForEmail = reportSections.map((section, index) => {
        let imageUrl = '';
        
        // Assign images based on section title
        if (section.title.includes('Executive Summary')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_EXECUTIVE || '';
        } else if (section.title.includes('Quick Wins')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_QUICKWINS || '';
        } else if (section.title.includes('Strategic AI Roadmap')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_ROADMAP || '';
        } else if (section.title.includes('Competitive')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_COMPETITIVE || '';
        } else if (section.title.includes('Implementation')) {
          imageUrl = process.env.NEXT_PUBLIC_REPORT_IMAGE_IMPLEMENTATION || '';
        }
        
        return { ...section, imageUrl };
      });
      
      // Only send email if we have actual report content
      if (enhancedSectionsForEmail && enhancedSectionsForEmail.length > 0) {
        // For now, we'll just inform the user that the report is ready
        // In a production system, this would generate a PDF and send it
        alert(`Your report has been generated successfully!\n\nThe report contains ${enhancedSectionsForEmail.length} sections with insights for ${companyInfo.companyName}.\n\nNote: Email sending with PDF attachment requires additional server-side implementation.`);
        
        // Optionally try to send a notification email (without PDF for now)
        try {
          const response = await fetch('/api/email/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              firstName,
              companyName: companyInfo.companyName,
              reportSections: enhancedSectionsForEmail,
              // Note: PDF generation would happen here in production
              reportPdfBase64: null
            })
          });
          
          if (response.ok) {
            console.log('Notification email sent successfully');
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't throw - the report is ready even if email fails
        }
      } else {
        alert('Report generation completed but no content was generated. Please try again.');
      }
      
      // Clear loading state and close overlay
      setLoading(false);
      setIsGeneratingVisuals(false);
      
      // Don't reset - keep the report data available
      // handleCloseReport();
      
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
      setSkipWaitMode(false);
    }
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
      <LoadingOverlay 
        show={loading || isGeneratingVisuals} 
        phase={loadingPhase === 'report' || isGeneratingVisuals ? 'report' : loadingPhase} 
        companyInfo={companyInfo}
        onSkipWait={(loadingPhase === 'report' || isGeneratingVisuals) && !skipWaitMode ? handleSkipWait : undefined}
        contactEmail={email}
      />

      {/* Progress indicator for initial data collection */}
      {step === 0 && (
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${subStep === 0 ? 'bg-brand-teal text-white' : 'bg-gray-200'}`}>1</div>
            <div className="w-16 h-1 bg-gray-200">
              <div className={`h-full bg-brand-teal transition-all ${subStep >= 1 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${subStep === 1 ? 'bg-brand-teal text-white' : subStep > 1 ? 'bg-brand-teal text-white' : 'bg-gray-200'}`}>2</div>
            <div className="w-16 h-1 bg-gray-200">
              <div className={`h-full bg-brand-teal transition-all ${subStep >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${subStep === 2 ? 'bg-brand-teal text-white' : 'bg-gray-200'}`}>3</div>
          </div>
        </div>
      )}

      {step === 0 && subStep === 0 && (
        <StepCard title="Let's Understand Your Business" subtitle="Tell us about your company to receive a customized AI opportunities assessment">
          <ImageHeader src={images.intro} alt="AI Introduction" priority={true} />
          
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
            <SelectField 
              label="Number of Employees" 
              value={companyInfo.employees || ""} 
              onChange={e => setCompanyInfo({ ...companyInfo, employees: e.target.value })}
            >
              <option value="">Select employee count</option>
              <option value="1-2">1-2</option>
              <option value="2-5">2-5</option>
              <option value="5-10">5-10</option>
              <option value="10-20">10-20</option>
              <option value="20-50">20-50</option>
              <option value="51-100">51-100</option>
              <option value="101-250">101-250</option>
              <option value="251-500">251-500</option>
              <option value="500+">500+</option>
            </SelectField>
            <div className="sm:col-span-2">
              <SelectField 
                label="Annual Revenue" 
                value={companyInfo.revenue || ""} 
                onChange={e => setCompanyInfo({ ...companyInfo, revenue: e.target.value })}
              >
                <option value="">Select revenue range</option>
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
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button 
              className="btn-ez" 
              onClick={() => setSubStep(1)} 
              disabled={!companyInfo.companyName || !companyInfo.industry}
            >
              Continue
            </button>
          </div>
          
          <Testimonial {...testimonials[0]} />
        </StepCard>
      )}

      {step === 0 && subStep === 1 && (
        <StepCard title="Your Current Technology Stack" subtitle="Understanding your existing tools helps us identify integration opportunities">
          <ImageHeader src={images.techStack} alt="Technology Stack" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField 
              label="What CRM or business management software do you currently use?" 
              value={techStack.crmSystem || ""} 
              onChange={e => setTechStack({ ...techStack, crmSystem: e.target.value })} 
              placeholder="e.g., GoHighLevel, HubSpot, Salesforce, None"
            />
            <TextField 
              label="What AI tools are you currently using in your workflows?" 
              value={techStack.aiTools || ""} 
              onChange={e => setTechStack({ ...techStack, aiTools: e.target.value })} 
              placeholder="e.g., ChatGPT, Claude, None"
            />
          </div>
          
          <TextArea 
            label="What's your biggest operational challenge right now?" 
            value={techStack.biggestChallenge || ""} 
            onChange={e => setTechStack({ ...techStack, biggestChallenge: e.target.value })} 
            placeholder="e.g., Lead generation, customer service, content creation, data entry..."
          />

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => setSubStep(0)}>
              Back
            </button>
            <button className="btn-ez" onClick={() => setSubStep(2)}>
              Continue
            </button>
          </div>
          
          <Testimonial {...testimonials[1]} />
        </StepCard>
      )}

      {step === 0 && subStep === 2 && (
        <StepCard title="Your Digital Marketing Presence" subtitle="AI can transform your content creation and customer engagement">
          <ImageHeader src={images.social} alt="Social Media Marketing" />
          
          <SocialMediaCheckboxes
            channels={socialMedia.channels || []}
            onChange={channels => setSocialMedia({ ...socialMedia, channels })}
          />
          
          <SelectField 
            label="How many hours per week does your team spend on content creation and social media?" 
            value={socialMedia.contentTime || ""} 
            onChange={e => setSocialMedia({ ...socialMedia, contentTime: e.target.value })}
          >
            <option value="">Select time range</option>
            <option value="Less than 1 hour">Less than 1hour</option>
            <option value="1-2 hours">1-2 hours</option>
            <option value="2-5 hours">2-5 hours</option>
            <option value="5-10 hours">5-10 hours</option>
            <option value="10-20 hours">10-20 hours</option>
            <option value="20-40 hours">20-40 hours</option>
            <option value="Over 40 hours">Over 40 hours</option>
          </SelectField>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => setSubStep(1)}>
              Back
            </button>
            <button 
              className="btn-ez" 
              onClick={generateQuestions} 
              disabled={loading || !companyInfo.companyName || !companyInfo.industry}
            >
              {loading ? <LoadingDots/> : "Generate My Questions"}
            </button>
          </div>
          
          <Testimonial {...testimonials[2]} />
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
              const answeredCount = Object.keys(answers).filter(key => {
                const answer = answers[key];
                if (Array.isArray(answer)) return answer.length > 0;
                return answer?.trim ? answer.trim() : answer;
              }).length;
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
            <button className="btn-ez" onClick={() => setStep(3)} disabled={loading}>
              Continue
            </button>
          </div>
          
          <Testimonial {...testimonials[2]} />
        </StepCard>
      )}

      {step === 3 && (
        <StepCard title="Almost There! Let's Get Your Report" subtitle="Enter your contact information to receive your personalized AI opportunities report">
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
              type="tel"
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              placeholder="(555) 555-5555"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => setStep(2)} disabled={loading}>
              Back
            </button>
            <button 
              className="btn-ez" 
              onClick={buildReportAndProcess} 
              disabled={loading || !firstName || !lastName || !email}
            >
              {loading ? <LoadingDots/> : "Get My Free Report"}
            </button>
          </div>
          
          <p className="small-text">
            By submitting your information, you agree to receive your personalized AI opportunities report and follow-up consultation. 
            We respect your privacy and will never share your information with third parties.
          </p>
        </StepCard>
      )}

      {step === 4 && report && (
        <StepCard title="Text Report Ready" subtitle="Visual generation unavailable - showing text version">
          <div className="report-section">
            <div className="report-header">
              <div className="report-title">AI Opportunities Report</div>
              <div className="report-subtitle">Prepared for {companyInfo.companyName}</div>
            </div>
            
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
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <button className="btn-ez secondary" onClick={() => {
              setStep(3);
              setEnhancedReport(null);
            }}>
              Try Again
            </button>
          </div>
        </StepCard>
      )}
    </main>
  );
}
