'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Award } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import EnhancedReport from '@/components/report/EnhancedReport';
import type { ReportSection } from '@/lib/report-types';
import './globals.css';

// --- TYPES ---
interface Question {
  id: string;
  text: string;
  type: 'select' | 'text' | 'checkbox' | 'textarea';
  options?: string[];
  placeholder?: string;
  helperText?: string;
}

interface ReportData {
  company_name: string;
  website: string;
  industry: string;
  executive_summary: string;
  quick_wins: Array<{ title: string; description: string; impact: string; timeline: string; }>;
  strategic_recommendations: Array<{ area: string; recommendation: string; benefits: string[]; }>;
  roi_projections: { efficiency_gains: string; cost_savings: string; revenue_opportunities: string; payback_period: string; };
  implementation_roadmap: Array<{ phase: string; timeline: string; focus_areas: string[]; }>;
  next_steps: string[];
}

// --- REUSABLE COMPONENTS ---

interface TestimonialProps {
  text: string;
  author: string;
  title: string;
  avatar: string;
}

const Testimonial = ({ text, author, title, avatar }: TestimonialProps) => (
  <div className="testimonial">
    <p className="testimonial-text">"{text}"</p>
    <div className="testimonial-author">
      <div className="testimonial-author-avatar">{avatar}</div>
      <div>
        <div className="testimonial-author-name">{author}</div>
        <div className="testimonial-author-title">{title}</div>
      </div>
    </div>
  </div>
);

interface FieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

const Field = ({ label, type, value, onChange, options, placeholder, required }: FieldProps) => {
  const commonProps = {
    id: label,
    value: value,
    placeholder: placeholder,
    required: required,
    className: `field-${type === 'textarea' ? 'textarea' : 'input'}`, 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="field-container">
      <label htmlFor={label} className="field-label">{label}</label>
      {type === 'select' ? (
        <select {...commonProps} onChange={handleChange}>
          <option value="" disabled>{placeholder || 'Select an option'}</option>
          {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea {...commonProps} onChange={handleChange} />
      ) : (
        <input type={type} {...commonProps} onChange={handleChange} />
      )}
    </div>
  );
};

interface CheckboxButtonGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

const CheckboxButtonGroup = ({ label, options, selected, onChange }: CheckboxButtonGroupProps) => {
  const handleSelect = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div className="field-container">
      <label className="field-label">{label}</label>
      <div className="checkbox-button-group">
        {options.map(option => (
          <div
            key={option}
            className={`checkbox-button ${selected.includes(option) ? 'selected' : ''}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};


export default function Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loadingNarrative, setLoadingNarrative] = useState('');

  const totalSteps = 7; // Welcome, Business Info, Questions (3), Contact Form, Report

  useEffect(() => {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
    const progressBar = document.querySelector('.progress-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
    }
  }, [currentStep]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // --- API & LOGIC (UNCHANGED) ---
  const fallbackQuestions: Question[] = [
    { id: 'current_pain_points', text: 'What are your biggest operational challenges right now?', type: 'textarea', placeholder: 'Describe challenges with efficiency, customer service, data management, etc.' },
    { id: 'growth_goals', text: 'What are your growth goals for the next 12 months?', type: 'textarea', placeholder: 'Revenue targets, market expansion, customer acquisition, etc.' },
    { id: 'automation_interest', text: 'Which areas would you most like to automate?', type: 'checkbox', options: ['Customer service & support', 'Sales & lead generation', 'Marketing & content creation', 'Data analysis & reporting', 'Administrative tasks'] },
  ];

  const generateQuestions = async () => {
    setLoadingNarrative('Analyzing your industry landscape...');
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: formData.company_name, website: formData.website, industry: formData.industry }),
      });
      if (!response.ok) {
        setDynamicQuestions(fallbackQuestions);
        return;
      }
      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        const formattedQuestions = data.questions.map((q: any, index: number) => ({
          id: q.id || `question_${index}`,
          text: q.text || q.question,
          type: q.type || 'textarea',
          options: q.options || undefined,
          placeholder: q.placeholder || 'Please provide your response',
        }));
        setDynamicQuestions(formattedQuestions);
      } else {
        setDynamicQuestions(fallbackQuestions);
      }
    } catch (error) {
      setDynamicQuestions(fallbackQuestions);
    } finally {
      setLoadingNarrative('');
    }
  };

  const generateReport = async () => {
    setLoadingMessage('Creating your personalized AI Opportunities Report...');
    setLoadingNarrative('Researching your industry\'s AI adoption trends...');
    try {
      const surveyAnswers = dynamicQuestions.reduce((acc: any, question) => {
        acc[question.id] = formData[question.id] || '';
        return acc;
      }, {});
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, survey_answers: surveyAnswers }),
      });
      if (!response.ok) throw new Error(`Failed to generate report: ${response.status}`);
      const data = await response.json();
      setReportData(data);
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    } finally {
      setLoadingNarrative('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setLoadingMessage('Saving your information...');
    try {
      const response = await fetch('/api/ghl/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, report: reportData }),
      });
      if (!response.ok) throw new Error('Failed to save contact');
      // Move to EnhancedReport view after successful submission
      setCurrentStep(6); // Show the EnhancedReport
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'There was an error submitting. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP TRANSITIONS ---
  const handleNext = async () => {
    if (currentStep === 0) { // After Business Info
      setIsLoading(true);
      setLoadingMessage('Generating personalized questions...');
      await generateQuestions();
      setIsLoading(false);
    }
    if (currentStep === 4) { // After all questions, generate report before contact form
      setIsLoading(true);
      try {
        await generateReport();
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setStatusMessage({ type: 'error', message: 'Failed to generate report. Please try again.' });
        return;
      }
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // --- RENDER LOGIC ---
  const renderStep = () => {
    // The original `case 0` (welcome) is removed as the first step is now the form itself.
    // The steps are re-mapped to match the image flow.
    switch (currentStep) {
      case 0: // Screen 1: Let's Understand Your Business
        return (
          <>
            <div className="card-header">
              <div className="card-header-image-container"><img src="/api/placeholder/720/200" alt="Business Assessment" /></div>
              <h1 className="card-title">Let's Understand Your Business</h1>
              <p className="card-subtitle">Tell us about your company to receive a customized AI opportunities assessment.</p>
            </div>
            <Field label="Company Name" type="text" value={formData.company_name || ''} onChange={v => handleInputChange('company_name', v)} placeholder="Your Company Name" required />
            <Field label="Website URL" type="text" value={formData.website || ''} onChange={v => handleInputChange('website', v)} placeholder="https://www.yourcompany.com" />
            <Field label="Industry" type="select" value={formData.industry || ''} onChange={v => handleInputChange('industry', v)} options={['Technology & Software', 'Healthcare & Medical', 'Financial Services', 'Retail & E-commerce', 'Manufacturing', 'Real Estate', 'Education', 'Marketing & Advertising', 'Legal Services', 'Hospitality & Tourism', 'Construction', 'Transportation & Logistics', 'Non-profit', 'Other']} placeholder="Select your industry" required />
            <Field label="Number of Employees" type="select" value={formData.company_size || ''} onChange={v => handleInputChange('company_size', v)} options={['1-10', '11-50', '51-200', '201-500', '500+']} placeholder="Select employee count" required />
            <Field label="Annual Revenue" type="select" value={formData.annual_revenue || ''} onChange={v => handleInputChange('annual_revenue', v)} options={['Under $100K', '$100K - $500K', '$500K - $1M', '$1M - $5M', '$5M - $10M', '$10M - $50M', 'Over $50M']} placeholder="Select revenue range" />
            <button className="btn-primary" onClick={handleNext}>Continue</button>
            <Testimonial text="The AI assessment identified 12 automation opportunities we hadn't considered. We've already implemented 3 and saved 20 hours per week." author="James Miller" title="Operations Director" avatar="JM" />
          </>
        );

      // Screens 2, 3, 4, 5 are now dynamically rendered from `dynamicQuestions`
      case 1: // Screen 2: Tech Stack
      case 2: // Screen 3: Marketing
      case 3: // Screen 4: Personalized Questions
      case 4: // Screen 5: Deeper Processes
        const questionsForStep = dynamicQuestions.slice(currentStep - 1, currentStep); // Simplified: show one question per step
        if (currentStep === 1) questionsForStep.unshift(...fallbackQuestions.slice(0,1)); // Manually add some static questions for flow
        if (currentStep === 2) questionsForStep.unshift(...fallbackQuestions.slice(1,2));
        if (currentStep === 3) questionsForStep.unshift(...fallbackQuestions.slice(2,3));


        const titles = ["Your Current Technology Stack", "Your Digital Marketing Presence", "Personalized Questions For Your Business", "Let's Dive Deeper Into Your Processes"];
        const subtitles = ["Understanding your existing tools helps us identify integration opportunities", "AI can transform your content creation and customer engagement", "Based on our analysis, we've identified key areas to explore", "These questions help us calculate your potential ROI from AI implementation"];
        const testimonials: (TestimonialProps | null)[] = [
          { text: "We replaced 5 different tools with one AI-powered system that integrates with our existing CRM. Efficiency increased by 40%.", author: "Sarah Kim", title: "Tech Startup Founder", avatar: "SK" },
          { text: "AI now creates 80% of our social media content. We went from posting twice a week to daily, and engagement tripled.", author: "Rachel Thompson", title: "Marketing Manager", avatar: "RT" },
          null,
          null
        ];

        return (
          <>
            <div className="card-header">
              <div className="card-header-image-container"><img src={`/api/placeholder/720/200?step=${currentStep}`} alt="Survey Step" /></div>
              <h1 className="card-title">{titles[currentStep - 1]}</h1>
              <p className="card-subtitle">{subtitles[currentStep - 1]}</p>
            </div>
            
            {/* This is a simplified logic. A more robust solution would map questions to steps. */}
            {dynamicQuestions.slice((currentStep-1)*2, (currentStep-1)*2 + 2).map(q => (
              q.type === 'checkbox' ? (
                <CheckboxButtonGroup key={q.id} label={q.text} options={q.options || []} selected={formData[q.id] || []} onChange={v => handleInputChange(q.id, v)} />
              ) : (
                <Field key={q.id} label={q.text} type={q.type as 'text' | 'email' | 'tel' | 'select' | 'textarea'} value={formData[q.id] || ''} onChange={v => handleInputChange(q.id, v)} placeholder={q.placeholder} />
              )
            ))}

            <div className="button-group">
              <button className="btn-secondary" onClick={handlePrevious}>Previous</button>
              <button className="btn-primary" onClick={handleNext}>Continue</button>
            </div>
            {testimonials[currentStep - 1] && (
              <Testimonial 
                text={testimonials[currentStep - 1]!.text}
                author={testimonials[currentStep - 1]!.author}
                title={testimonials[currentStep - 1]!.title}
                avatar={testimonials[currentStep - 1]!.avatar}
              />
            )}
          </>
        );

      case 5: // Contact Form (Report already generated)
        return (
          <>
            <div className="card-header">
              <div className="card-header-image-container"><img src="/api/placeholder/720/200" alt="AI Transformation Report" /></div>
              <h1 className="card-title">Your AI Transformation Report is Ready!</h1>
              <p className="card-subtitle">Enter your contact information to receive your personalized AI opportunities report.</p>
            </div>
            <Field label="First Name" type="text" value={formData.first_name || ''} onChange={v => handleInputChange('first_name', v)} placeholder="First Name" required />
            <Field label="Last Name" type="text" value={formData.last_name || ''} onChange={v => handleInputChange('last_name', v)} placeholder="Last Name" required />
            <Field label="Email Address" type="email" value={formData.email || ''} onChange={v => handleInputChange('email', v)} placeholder="email@company.com" required />
            <Field label="Phone Number" type="tel" value={formData.phone || ''} onChange={v => handleInputChange('phone', v)} placeholder="(555) 555-5555" required />
            <button className="btn-primary" onClick={handleSubmit}>Get My AI Report</button>
            <p className="disclaimer">By submitting your information, you agree to receive your personalized AI opportunities report and follow-up consultation. We respect your privacy and will never share your information with third parties.</p>
          </>
        );

      case 6: // Show EnhancedReport with magazine styling
        if (reportData) {
          // Transform report data into sections for EnhancedReport
          const sections: ReportSection[] = [
            {
              title: "Executive Summary",
              mainContent: reportData.executive_summary,
              imagePrompt: `Modern office with AI technology, ${reportData.industry} business transformation`,
              pullQuote: `Your ${reportData.industry} business has significant AI opportunities`,
              keyTakeaways: reportData.quick_wins.slice(0, 3).map(w => w.title)
            },
            {
              title: "Quick Wins",
              mainContent: reportData.quick_wins.map(win => 
                `${win.title}: ${win.description} (Impact: ${win.impact}, Timeline: ${win.timeline})`
              ).join('\n\n'),
              imagePrompt: `Business growth chart, success metrics, ${reportData.industry} automation`,
              statistic: {
                value: reportData.roi_projections.cost_savings,
                description: "Potential Cost Savings"
              },
              keyTakeaways: reportData.quick_wins.map(w => w.title)
            },
            {
              title: "Strategic Recommendations",
              mainContent: reportData.strategic_recommendations.map(rec => 
                `${rec.area}: ${rec.recommendation}\n\nBenefits: ${rec.benefits.join(', ')}`
              ).join('\n\n'),
              imagePrompt: `Strategic planning, AI implementation roadmap, ${reportData.industry} innovation`,
              pullQuote: "Transform your operations with AI-powered automation",
              keyTakeaways: reportData.strategic_recommendations.map(r => r.area)
            },
            {
              title: "ROI & Implementation",
              mainContent: `Efficiency Gains: ${reportData.roi_projections.efficiency_gains}\n\nCost Savings: ${reportData.roi_projections.cost_savings}\n\nRevenue Opportunities: ${reportData.roi_projections.revenue_opportunities}\n\nPayback Period: ${reportData.roi_projections.payback_period}\n\n` +
                reportData.implementation_roadmap.map(phase => 
                  `${phase.phase} (${phase.timeline}):\n${phase.focus_areas.join(', ')}`
                ).join('\n\n'),
              imagePrompt: `ROI metrics dashboard, financial growth, ${reportData.industry} success`,
              statistic: {
                value: reportData.roi_projections.efficiency_gains,
                description: "Efficiency Improvement"
              },
              keyTakeaways: reportData.next_steps
            }
          ];

          return (
            <EnhancedReport 
              sections={sections}
              businessName={reportData.company_name}
              onClose={() => {
                // Optional: Handle close or reset
                window.location.href = '/';
              }}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="container">
      {isLoading && <LoadingOverlay 
        show={true} 
        phase={currentStep === 0 ? "questions" : "report"}
        companyInfo={{
          companyName: formData.company_name,
          industry: formData.industry,
          websiteURL: formData.website
        }}
      />}
      <div className="survey-card">
        {!isLoading && renderStep()}
      </div>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
      </div>
    </div>
  );
}
