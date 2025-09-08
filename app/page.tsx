'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Clock, Target, Award, TrendingUp, Users, BarChart } from 'lucide-react';
import StepCard from '@/components/StepCard';
import Field from '@/components/Field';
import LoadingOverlay from '@/components/LoadingOverlay';
import ReportDisplay from '@/components/ReportDisplay';
import './globals.css';

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
  current_state: {
    tech_maturity: string;
    key_challenges: string[];
    existing_tools: string[];
  };
  quick_wins: Array<{
    title: string;
    description: string;
    impact: string;
    timeline: string;
    estimated_savings?: string;
  }>;
  strategic_recommendations: Array<{
    area: string;
    recommendation: string;
    benefits: string[];
    priority: string;
    implementation_complexity: string;
  }>;
  competitive_analysis: {
    industry_trends: string[];
    competitor_capabilities: string[];
    opportunities: string[];
  };
  roi_projections: {
    efficiency_gains: string;
    cost_savings: string;
    revenue_opportunities: string;
    payback_period: string;
  };
  implementation_roadmap: Array<{
    phase: string;
    timeline: string;
    focus_areas: string[];
    expected_outcomes: string[];
  }>;
  risk_assessment: {
    potential_risks: string[];
    mitigation_strategies: string[];
  };
  next_steps: string[];
  sources: string[];
}

export default function Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loadingNarrative, setLoadingNarrative] = useState('');

  const totalSteps = 7;

  const updateProgress = () => {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
    const progressBar = document.querySelector('.progress-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
    }
  };

  useEffect(() => {
    updateProgress();
  }, [currentStep]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const fallbackQuestions: Question[] = [
    {
      id: 'current_pain_points',
      text: 'What are your biggest operational challenges right now?',
      type: 'textarea',
      placeholder: 'Describe challenges with efficiency, customer service, data management, etc.',
      helperText: 'Help us understand where AI can make the biggest impact'
    },
    {
      id: 'growth_goals',
      text: 'What are your growth goals for the next 12 months?',
      type: 'textarea',
      placeholder: 'Revenue targets, market expansion, customer acquisition, etc.',
      helperText: 'AI can accelerate your path to these goals'
    },
    {
      id: 'automation_interest',
      text: 'Which areas would you most like to automate?',
      type: 'checkbox',
      options: [
        'Customer service & support',
        'Sales & lead generation',
        'Marketing & content creation',
        'Data analysis & reporting',
        'Administrative tasks',
        'Inventory & operations',
        'HR & recruitment',
        'Financial processes'
      ]
    },
    {
      id: 'budget_range',
      text: 'What\'s your annual budget for technology improvements?',
      type: 'select',
      options: [
        'Under $10,000',
        '$10,000 - $50,000',
        '$50,000 - $100,000',
        '$100,000 - $500,000',
        'Over $500,000',
        'Not sure yet'
      ]
    },
    {
      id: 'timeline',
      text: 'When do you want to start implementing AI solutions?',
      type: 'select',
      options: [
        'Immediately',
        'Within 1-3 months',
        'Within 3-6 months',
        'Within 6-12 months',
        'Just exploring options'
      ]
    }
  ];

  const generateQuestions = async () => {
    setLoadingNarrative('Analyzing your industry landscape and competitors...');
    
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.company_name,
          website: formData.website,
          industry: formData.industry,
          company_size: formData.company_size,
          annual_revenue: formData.annual_revenue,
          tech_stack: formData.tech_stack,
          social_media: formData.social_media
        })
      });

      if (!response.ok) {
        console.error('Failed to generate questions:', response.status);
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
          helperText: q.helperText || undefined
        }));
        setDynamicQuestions(formattedQuestions);
        setLoadingNarrative('');
      } else {
        setDynamicQuestions(fallbackQuestions);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setDynamicQuestions(fallbackQuestions);
      setLoadingNarrative('');
    }
  };

  const generateReport = async () => {
    setLoadingMessage('Creating your personalized AI Opportunities Report...');
    setLoadingNarrative('Researching your industry\'s AI adoption trends...');
    
    setTimeout(() => setLoadingNarrative('Analyzing your competitors\' technology strategies...'), 3000);
    setTimeout(() => setLoadingNarrative('Identifying quick wins and ROI opportunities...'), 6000);
    setTimeout(() => setLoadingNarrative('Building your custom implementation roadmap...'), 9000);
    
    try {
      const surveyAnswers = dynamicQuestions.reduce((acc: any, question) => {
        acc[question.id] = formData[question.id] || '';
        return acc;
      }, {});

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          survey_answers: surveyAnswers
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
      setLoadingNarrative('');
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      setLoadingNarrative('');
      throw error;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setIsLoading(true);
      setLoadingMessage('Generating personalized questions for your business...');
      await generateQuestions();
      setIsLoading(false);
    } else if (currentStep === 3) {
      setIsLoading(true);
      try {
        await generateReport();
        setIsLoading(false);
        setCurrentStep(currentStep + 1);
        return;
      } catch (error) {
        setIsLoading(false);
        setStatusMessage({ 
          type: 'error', 
          message: 'Failed to generate report. Please try again.' 
        });
        return;
      }
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setLoadingMessage('Saving your information...');
    
    try {
      const response = await fetch('/api/ghl/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          report: reportData,
          survey_answers: dynamicQuestions.reduce((acc: any, q) => {
            acc[q.id] = formData[q.id] || '';
            return acc;
          }, {})
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save contact');
      }

      setStatusMessage({ 
        type: 'success', 
        message: 'Thank you! Your AI Opportunities Report has been sent to your email.' 
      });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'There was an error submitting your information. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepCard
            title="Welcome to Your AI Transformation Journey"
            subtitle="Let's discover how AI can revolutionize your business"
          >
            <div className="image-container">
              <div className="image-shadow"></div>
              <div className="image-frame">
                <img src="/api/placeholder/720/400" alt="AI Innovation" />
              </div>
            </div>
            
            <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>
              Join thousands of businesses already using AI to increase efficiency by 40%, 
              reduce costs by 30%, and accelerate growth. This personalized assessment will 
              identify your biggest AI opportunities.
            </p>

            <div className="testimonial">
              <div className="testimonial-text">
                "AI automation saved us 20 hours per week and increased our customer satisfaction by 35%. 
                This assessment showed us opportunities we didn't even know existed."
              </div>
              <div className="testimonial-author">
                <div className="profile-image">JD</div>
                <div>
                  <div style={{ fontWeight: 600 }}>James Davidson</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>CEO, TechFlow Solutions</div>
                </div>
              </div>
            </div>

            <button className="btn" onClick={handleNext}>
              Start Your Assessment <ChevronRight style={{ display: 'inline', marginLeft: '5px' }} />
            </button>
            
            <p className="small-text">
              <Clock style={{ display: 'inline', width: '14px', marginRight: '5px' }} />
              Takes only 3-4 minutes • Get instant personalized report • 100% free
            </p>
          </StepCard>
        );

      case 1:
        return (
          <StepCard
            title="Tell Us About Your Business"
            subtitle="Help us understand your company to provide relevant AI recommendations"
          >
            <Field
              label="Company Name"
              type="text"
              value={formData.company_name || ''}
              onChange={(value) => handleInputChange('company_name', value)}
              placeholder="Enter your company name"
              required
            />
            
            <Field
              label="Website"
              type="text"
              value={formData.website || ''}
              onChange={(value) => handleInputChange('website', value)}
              placeholder="https://www.yourcompany.com"
            />
            
            <Field
              label="Industry"
              type="select"
              value={formData.industry || ''}
              onChange={(value) => handleInputChange('industry', value)}
              options={[
                'Technology & Software',
                'Healthcare & Medical',
                'Financial Services',
                'Retail & E-commerce',
                'Manufacturing',
                'Real Estate',
                'Education',
                'Marketing & Advertising',
                'Legal Services',
                'Hospitality & Tourism',
                'Construction',
                'Transportation & Logistics',
                'Non-profit',
                'Other'
              ]}
              required
            />
            
            <Field
              label="Company Size"
              type="select"
              value={formData.company_size || ''}
              onChange={(value) => handleInputChange('company_size', value)}
              options={[
                '1-10 employees',
                '11-50 employees',
                '51-200 employees',
                '201-500 employees',
                '500+ employees'
              ]}
              required
            />
            
            <Field
              label="Annual Revenue"
              type="select"
              value={formData.annual_revenue || ''}
              onChange={(value) => handleInputChange('annual_revenue', value)}
              options={[
                'Under $100K',
                '$100K - $500K',
                '$500K - $1M',
                '$1M - $5M',
                '$5M - $10M',
                '$10M - $50M',
                'Over $50M'
              ]}
            />
            
            <Field
              label="Current Tech Stack (Optional)"
              type="textarea"
              value={formData.tech_stack || ''}
              onChange={(value) => handleInputChange('tech_stack', value)}
              placeholder="E.g., Salesforce, QuickBooks, Shopify, WordPress, etc."
            />
            
            <Field
              label="Social Media/LinkedIn (Optional)"
              type="text"
              value={formData.social_media || ''}
              onChange={(value) => handleInputChange('social_media', value)}
              placeholder="LinkedIn profile or other social media URL"
            />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={handlePrevious}>Previous</button>
              <button className="btn" style={{ flex: 2 }} onClick={handleNext}>
                Generate My Questions <ChevronRight style={{ display: 'inline', marginLeft: '5px' }} />
              </button>
            </div>
          </StepCard>
        );

      case 2:
        return (
          <StepCard
            title="Your Personalized AI Assessment"
            subtitle="Based on your industry and business profile"
          >
            {dynamicQuestions.map((question, index) => (
              <div key={question.id} style={{ marginBottom: '25px' }}>
                <Field
                  label={`${index + 1}. ${question.text}`}
                  type={question.type}
                  value={formData[question.id] || ''}
                  onChange={(value) => handleInputChange(question.id, value)}
                  options={question.options}
                  placeholder={question.placeholder}
                  helperText={question.helperText}
                  required
                />
              </div>
            ))}
            
            <div className="testimonial">
              <div className="testimonial-text">
                "The personalized questions really understood our unique challenges. 
                The AI recommendations we received were spot-on and immediately actionable."
              </div>
              <div className="testimonial-author">
                <div className="profile-image">SK</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Sarah Kim</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>COO, Retail Dynamics</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={handlePrevious}>Previous</button>
              <button className="btn" style={{ flex: 2 }} onClick={handleNext}>
                Continue <ChevronRight style={{ display: 'inline', marginLeft: '5px' }} />
              </button>
            </div>
          </StepCard>
        );

      case 3:
        return (
          <StepCard
            title="Opportunity Discovery"
            subtitle="Help us identify your biggest AI opportunities"
          >
            <Field
              label="What's your biggest business challenge right now?"
              type="textarea"
              value={formData.biggest_challenge || ''}
              onChange={(value) => handleInputChange('biggest_challenge', value)}
              placeholder="E.g., Too much time on repetitive tasks, difficulty scaling customer service, need better data insights..."
              required
            />
            
            <Field
              label="Which departments need the most help?"
              type="checkbox"
              value={formData.departments_need_help || []}
              onChange={(value) => handleInputChange('departments_need_help', value)}
              options={[
                'Sales & Business Development',
                'Marketing & Content',
                'Customer Service & Support',
                'Operations & Logistics',
                'Finance & Accounting',
                'HR & Recruitment',
                'IT & Development',
                'Data & Analytics'
              ]}
              required
            />
            
            <Field
              label="What would success look like in 12 months?"
              type="textarea"
              value={formData.success_metrics || ''}
              onChange={(value) => handleInputChange('success_metrics', value)}
              placeholder="E.g., 50% less time on admin work, 2x more leads, 30% cost reduction..."
              required
            />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={handlePrevious}>Previous</button>
              <button className="btn" style={{ flex: 2 }} onClick={handleNext}>
                Generate My Report <Award style={{ display: 'inline', marginLeft: '5px' }} />
              </button>
            </div>
          </StepCard>
        );

      case 4:
        return reportData ? (
          <ReportDisplay reportData={reportData} />
        ) : (
          <StepCard
            title="Generating Your Report"
            subtitle="Please wait while we analyze your responses"
          >
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Creating your personalized AI report...</div>
              {loadingNarrative && (
                <div className="ez-fade">{loadingNarrative}</div>
              )}
            </div>
          </StepCard>
        );

      case 5:
        return (
          <StepCard
            title="Get Your Complete AI Opportunities Report"
            subtitle="Receive your personalized roadmap and recommendations"
          >
            <div className="image-container">
              <div className="image-shadow"></div>
              <div className="image-frame">
                <img src="/api/placeholder/720/400" alt="Report Preview" />
              </div>
            </div>
            
            <p style={{ fontSize: '16px', marginBottom: '25px', textAlign: 'center' }}>
              Your custom report includes ROI projections, implementation roadmap, 
              and specific AI tools for your business.
            </p>
            
            <Field
              label="First Name"
              type="text"
              value={formData.first_name || ''}
              onChange={(value) => handleInputChange('first_name', value)}
              placeholder="John"
              required
            />
            
            <Field
              label="Last Name"
              type="text"
              value={formData.last_name || ''}
              onChange={(value) => handleInputChange('last_name', value)}
              placeholder="Smith"
              required
            />
            
            <Field
              label="Work Email"
              type="email"
              value={formData.email || ''}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="john@company.com"
              required
            />
            
            <Field
              label="Phone Number"
              type="tel"
              value={formData.phone || ''}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="(555) 123-4567"
              required
            />
            
            <Field
              label="Your Role"
              type="select"
              value={formData.role || ''}
              onChange={(value) => handleInputChange('role', value)}
              options={[
                'Owner/Founder',
                'CEO/President',
                'COO/Operations',
                'CFO/Finance',
                'CTO/Technology',
                'CMO/Marketing',
                'Director/VP',
                'Manager',
                'Other Decision Maker'
              ]}
              required
            />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn" style={{ flex: 1 }} onClick={handlePrevious}>Previous</button>
              <button 
                className="btn" 
                style={{ flex: 2, background: '#ff6b11' }} 
                onClick={handleSubmit}
              >
                Get My Free Report <TrendingUp style={{ display: 'inline', marginLeft: '5px' }} />
              </button>
            </div>
            
            <p className="small-text">
              🔒 Your information is secure and will never be shared. 
              You'll receive your personalized AI Opportunities Report instantly via email.
            </p>
          </StepCard>
        );

      case 6:
        return (
          <StepCard
            title="🎉 Success! Your Report is Ready"
            subtitle="Check your email for your personalized AI Opportunities Report"
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #08b2c6 0%, #b5feff 100%)',
              padding: '40px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <Award size={60} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>
                Your AI Journey Starts Now!
              </h3>
              <p style={{ fontSize: '16px', opacity: 0.95 }}>
                We've identified {reportData?.quick_wins?.length || 5} immediate opportunities 
                that could save your business significant time and money.
              </p>
            </div>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '25px', 
              borderRadius: '8px',
              marginBottom: '25px'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#08b2c6' }}>
                <BarChart style={{ display: 'inline', marginRight: '8px' }} />
                What's in Your Report:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  'Personalized AI implementation roadmap',
                  'ROI projections and cost savings analysis',
                  'Specific tool recommendations for your industry',
                  'Quick wins you can implement immediately',
                  'Competitive advantage opportunities'
                ].map((item, index) => (
                  <li key={index} style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Target size={16} style={{ marginRight: '10px', color: '#ff6b11' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="testimonial">
              <div className="testimonial-text">
                "The report identified $200K in annual savings through AI automation. 
                We implemented the quick wins immediately and saw results within weeks."
              </div>
              <div className="testimonial-author">
                <div className="profile-image">MP</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Michael Park</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>CFO, Global Logistics Inc.</div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: '#fff5ef', 
              border: '2px solid #ff6b11',
              padding: '20px', 
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '25px'
            }}>
              <Users size={30} style={{ color: '#ff6b11', marginBottom: '10px' }} />
              <h4 style={{ color: '#ff6b11', marginBottom: '10px' }}>Ready to Accelerate?</h4>
              <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                Our AI experts are standing by to help you implement these opportunities 
                and transform your business.
              </p>
              <button 
                className="btn" 
                style={{ background: '#ff6b11' }}
                onClick={() => window.location.href = 'https://ezwai.com/consultation'}
              >
                Schedule Free Consultation
              </button>
            </div>
            
            {statusMessage.message && (
              <div className={`statusMessage ${statusMessage.type}`}>
                {statusMessage.message}
              </div>
            )}
          </StepCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      {isLoading && <LoadingOverlay message={loadingMessage} narrative={loadingNarrative} />}
      {renderStep()}
      <div className="progress-container">
        <div className="progress-bar"></div>
      </div>
    </div>
  );
}