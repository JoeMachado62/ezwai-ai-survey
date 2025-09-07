"use client";

import { useState, useEffect, FormEvent } from "react";
import LoadingNarrative from "@/components/LoadingNarrative";

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<"questions" | "report" | undefined>();
  const [statusMessage, setStatusMessage] = useState("");
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  
  // Survey data state
  const [surveyData, setSurveyData] = useState({
    companyInfo: {
      companyName: "",
      websiteURL: "",
      industry: "",
      employees: "",
      revenue: ""
    },
    techStack: {
      crmSystem: "",
      aiTools: "",
      biggestChallenge: ""
    },
    socialMedia: {
      channels: [] as string[],
      contentTime: ""
    },
    dynamicQuestions: {} as any,
    contactInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });

  // Update progress bar
  useEffect(() => {
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      const progressPercentage = (currentStep / totalSteps) * 100;
      progressBar.style.width = `${progressPercentage}%`;
      progressBar.classList.add("active");
      setTimeout(() => progressBar.classList.remove("active"), 1000);
    }
  }, [currentStep]);

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (value: string) => {
    setSurveyData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        channels: prev.socialMedia.channels.includes(value)
          ? prev.socialMedia.channels.filter(ch => ch !== value)
          : [...prev.socialMedia.channels, value]
      }
    }));
  };

  // Generate dynamic questions with minimum loading time and retry logic
  const generateDynamicQuestions = async () => {
    setLoading(true);
    setCurrentStep(4);
    
    const startTime = Date.now();
    const minimumLoadingTime = 15000; // 15 seconds minimum
    const maxRetryTime = 20000; // Retry after 20 seconds
    let retryCount = 0;
    const maxRetries = 2;
    
    const makeApiCall = async () => {
      try {
        const response = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyInfo: surveyData.companyInfo,
            techStack: surveyData.techStack,
            socialMedia: surveyData.socialMedia
          }),
          signal: AbortSignal.timeout(maxRetryTime) // Timeout after 20 seconds
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, questions: data.questions || [] };
        } else {
          return { success: false };
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log("Request timed out, retrying...");
        }
        return { success: false, error };
      }
    };
    
    // Make initial API call
    let result = await makeApiCall();
    
    // Retry logic if initial call fails or times out
    while (!result.success && retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying API call (attempt ${retryCount + 1})...`);
      result = await makeApiCall();
    }
    
    // Ensure minimum loading time
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minimumLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime));
    }
    
    // Set questions and proceed
    if (result.success && result.questions) {
      setDynamicQuestions(result.questions);
    } else {
      // Personalized fallback questions based on collected data
      const fallbackQuestions = [];
      
      // Industry-specific question
      if (surveyData.companyInfo.industry) {
        fallbackQuestions.push({
          type: "radio",
          text: `In the ${surveyData.companyInfo.industry} industry, which area would benefit most from AI automation?`,
          options: [
            "Customer service and support",
            "Operations and logistics",
            "Sales and marketing",
            "Data analysis and reporting"
          ]
        });
      }
      
      // Challenge-specific question
      if (surveyData.techStack.biggestChallenge) {
        fallbackQuestions.push({
          type: "text",
          text: `Regarding your challenge with "${surveyData.techStack.biggestChallenge}", what specific tasks take the most time?`
        });
      }
      
      // CRM-specific question
      if (surveyData.techStack.crmSystem) {
        fallbackQuestions.push({
          type: "radio",
          text: `How effectively are you currently using ${surveyData.techStack.crmSystem} for automation?`,
          options: [
            "Not using any automation features",
            "Basic automation only",
            "Moderate automation usage",
            "Extensive automation"
          ]
        });
      }
      
      // Social media question if applicable
      if (surveyData.socialMedia.channels && surveyData.socialMedia.channels.length > 0) {
        fallbackQuestions.push({
          type: "radio",
          text: `For your ${surveyData.socialMedia.channels.join(', ')} content, what's your biggest pain point?`,
          options: [
            "Coming up with content ideas",
            "Writing engaging posts",
            "Creating visuals and graphics",
            "Scheduling and consistency"
          ]
        });
      }
      
      // Size-based question
      if (surveyData.companyInfo.employees) {
        fallbackQuestions.push({
          type: "text",
          text: `With ${surveyData.companyInfo.employees} employees, which departments struggle most with manual processes?`
        });
      }
      
      // Generic questions only if we need more
      if (fallbackQuestions.length < 4) {
        fallbackQuestions.push({
          type: "radio",
          text: "Which business process currently takes the most manual effort?",
          options: ["Data entry", "Report generation", "Customer communication", "Internal coordination"]
        });
        fallbackQuestions.push({
          type: "text",
          text: "What's one task you wish could be automated today?"
        });
      }
      
      setDynamicQuestions(fallbackQuestions);
    }
    
    setCurrentStep(5); // Go to dynamic questions step 1
    setLoading(false);
  };

  // Generate report
  const generateReport = async () => {
    setLoading(true);
    
    try {
      // Create aiSummary from the dynamic questions that were generated
      const aiSummary = dynamicQuestions.length > 0 
        ? `Generated ${dynamicQuestions.length} personalized questions for ${surveyData.companyInfo.companyName || 'the company'} in the ${surveyData.companyInfo.industry || 'their'} industry, focusing on ${surveyData.techStack.biggestChallenge || 'operational improvements'}.`
        : "AI assessment pending";
      
      // Combine all answers from both dynamic questions and contact info
      const allAnswers = {
        ...surveyData.dynamicQuestions,
        companyName: surveyData.companyInfo.companyName,
        industry: surveyData.companyInfo.industry,
        employees: surveyData.companyInfo.employees,
        revenue: surveyData.companyInfo.revenue,
        crmSystem: surveyData.techStack.crmSystem,
        aiTools: surveyData.techStack.aiTools,
        biggestChallenge: surveyData.techStack.biggestChallenge,
        socialChannels: surveyData.socialMedia.channels?.join(', '),
        contentTime: surveyData.socialMedia.contentTime
      };
      
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyInfo: surveyData.companyInfo,
          techStack: surveyData.techStack,
          socialMedia: surveyData.socialMedia,
          aiSummary: aiSummary,
          answers: allAnswers
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data);
        return data; // Return the report for use in submitLead
      } else {
        const errorText = await response.text();
        console.error("Report API error:", errorText);
        return null;
      }
    } catch (error) {
      console.error("Error generating report:", error);
      return null;
    } finally {
      setLoading(false);
      setLoadingPhase(undefined);
    }
  };

  // Submit lead to GoHighLevel
  const submitLead = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");
    
    try {
      // Generate the report first
      const generatedReport = await generateReport();
      
      if (!generatedReport) {
        setStatusMessage("Failed to generate AI report. Please try again.");
        setLoading(false);
        return;
      }
      
      // Submit to GoHighLevel with all required data
      const response = await fetch("/api/ghl/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: surveyData.contactInfo.firstName,
          lastName: surveyData.contactInfo.lastName,
          email: surveyData.contactInfo.email,
          phone: surveyData.contactInfo.phone,
          companyInfo: surveyData.companyInfo,
          techStack: surveyData.techStack,
          socialMedia: surveyData.socialMedia,
          answers: surveyData.dynamicQuestions,
          report: generatedReport
        })
      });

      if (response.ok) {
        setStatusMessage("Success! Your AI report has been generated and sent to your email.");
        setCurrentStep(8); // Show report
      } else {
        const errorText = await response.text();
        console.error("GHL API error:", errorText);
        setStatusMessage("Failed to save contact. Please check your information and try again.");
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      setStatusMessage("There was an error submitting your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        {/* Step 1: Company Information */}
        <div className={`step ${currentStep === 1 ? "active" : ""}`}>
          <div className="image-container">
            <div className="image-shadow"></div>
            <div className="image-frame">
              <img 
                src="https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68baffc29846a685cc4f2bb2.webp" 
                alt="AI Introduction"
              />
            </div>
          </div>
          
          <h2>Let's Understand Your Business</h2>
          <p>Tell us about your company to receive a customized AI opportunities assessment</p>
          
          <label htmlFor="companyName">Company Name</label>
          <input 
            type="text" 
            id="companyName" 
            placeholder="Your Company Name" 
            required
            value={surveyData.companyInfo.companyName}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, companyName: e.target.value }
            }))}
          />
          
          <label htmlFor="websiteURL">Website URL</label>
          <input 
            type="text" 
            id="websiteURL" 
            placeholder="https://www.yourcompany.com"
            value={surveyData.companyInfo.websiteURL}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, websiteURL: e.target.value }
            }))}
          />
          
          <label htmlFor="industry">Industry</label>
          <select 
            id="industry" 
            required
            value={surveyData.companyInfo.industry}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, industry: e.target.value }
            }))}
          >
            <option value="" disabled>Select your industry</option>
            <option value="healthcare">Healthcare</option>
            <option value="ecommerce">E-commerce</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="professional_services">Professional Services</option>
            <option value="real_estate">Real Estate</option>
            <option value="finance">Finance & Banking</option>
            <option value="retail">Retail</option>
            <option value="hospitality">Hospitality</option>
            <option value="education">Education</option>
            <option value="logistics">Logistics & Transportation</option>
            <option value="construction">Construction</option>
            <option value="legal">Legal Services</option>
            <option value="marketing">Marketing & Advertising</option>
            <option value="technology">Technology</option>
            <option value="nonprofit">Non-Profit</option>
            <option value="other">Other</option>
          </select>
          
          <label htmlFor="employees">Number of Employees</label>
          <select 
            id="employees" 
            required
            value={surveyData.companyInfo.employees}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, employees: e.target.value }
            }))}
          >
            <option value="" disabled>Select employee count</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>
          
          <label htmlFor="revenue">Annual Revenue</label>
          <select 
            id="revenue" 
            required
            value={surveyData.companyInfo.revenue}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, revenue: e.target.value }
            }))}
          >
            <option value="" disabled>Select revenue range</option>
            <option value="Under $500k">Under $500k</option>
            <option value="$500k-$1M">$500k - $1M</option>
            <option value="$1M-$5M">$1M - $5M</option>
            <option value="$5M-$10M">$5M - $10M</option>
            <option value="$10M-$50M">$10M - $50M</option>
            <option value="Over $50M">Over $50M</option>
          </select>
          
          <button 
            className="btn"
            onClick={() => {
              if (!surveyData.companyInfo.companyName || !surveyData.companyInfo.industry || 
                  !surveyData.companyInfo.employees || !surveyData.companyInfo.revenue) {
                alert("Please fill in all required fields");
                return;
              }
              setCurrentStep(2);
            }}
          >
            Continue
          </button>
          
          <div className="testimonial">
            <div className="testimonial-text">
              "The AI assessment identified 12 automation opportunities we hadn't considered. We've already implemented 3 and saved 20 hours per week."
            </div>
            <div className="testimonial-author">
              <div className="profile-image">JM</div>
              <span>- James Miller, Operations Director</span>
            </div>
          </div>
        </div>

        {/* Step 2: Current Tech Stack */}
        <div className={`step ${currentStep === 2 ? "active" : ""}`}>
          <div className="image-container">
            <div className="image-shadow"></div>
            <div className="image-frame">
              <img 
                src="https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg" 
                alt="Tech Stack"
              />
            </div>
          </div>
          
          <h2>Your Current Technology Stack</h2>
          <p>Understanding your existing tools helps us identify integration opportunities</p>
          
          <label htmlFor="crmSystem">What CRM or business management software do you currently use?</label>
          <input 
            type="text" 
            id="crmSystem" 
            placeholder="None, Excel, Salesforce, HubSpot, etc."
            value={surveyData.techStack.crmSystem}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              techStack: { ...prev.techStack, crmSystem: e.target.value }
            }))}
          />
          
          <label htmlFor="aiTools">What AI tools are you currently using in your workflows?</label>
          <textarea 
            id="aiTools" 
            placeholder="ChatGPT, Claude, Jasper, None, etc. List all AI tools you're using"
            value={surveyData.techStack.aiTools}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              techStack: { ...prev.techStack, aiTools: e.target.value }
            }))}
          />
          
          <label htmlFor="biggestChallenge">What's your biggest operational challenge right now?</label>
          <textarea 
            id="biggestChallenge" 
            placeholder="Describe the main challenge that's slowing down your business"
            value={surveyData.techStack.biggestChallenge}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              techStack: { ...prev.techStack, biggestChallenge: e.target.value }
            }))}
          />
          
          <button 
            className="btn"
            onClick={() => setCurrentStep(3)}
          >
            Continue
          </button>
          
          <div className="testimonial">
            <div className="testimonial-text">
              "We replaced 5 different tools with one AI-powered system that integrates with our existing CRM. Efficiency increased by 40%."
            </div>
            <div className="testimonial-author">
              <div className="profile-image">SK</div>
              <span>- Sarah Kim, Tech Startup Founder</span>
            </div>
          </div>
        </div>

        {/* Step 3: Social Media Presence */}
        <div className={`step ${currentStep === 3 ? "active" : ""}`}>
          <div className="image-container">
            <div className="image-shadow"></div>
            <div className="image-frame">
              <img 
                src="https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb04c89846a6c43e4fd338.webp" 
                alt="Social Media AI"
              />
            </div>
          </div>
          
          <h2>Your Digital Marketing Presence</h2>
          <p>AI can transform your content creation and customer engagement</p>
          
          <label>Which social media marketing channels are you active on?</label>
          <div className="checkbox-group">
            {["YouTube", "Facebook", "Instagram", "Twitter/X", "LinkedIn", "Website Blog", "TikTok", "Other"].map(channel => (
              <div 
                key={channel}
                className={`checkbox-item ${surveyData.socialMedia.channels.includes(channel) ? "checked" : ""}`}
                onClick={() => handleCheckboxToggle(channel)}
              >
                <input 
                  type="checkbox" 
                  checked={surveyData.socialMedia.channels.includes(channel)}
                  onChange={() => {}}
                />
                <label>{channel}</label>
              </div>
            ))}
          </div>
          
          <label htmlFor="contentTime">How many hours per week does your team spend on content creation and social media?</label>
          <select 
            id="contentTime" 
            required
            value={surveyData.socialMedia.contentTime}
            onChange={(e) => setSurveyData(prev => ({
              ...prev,
              socialMedia: { ...prev.socialMedia, contentTime: e.target.value }
            }))}
          >
            <option value="" disabled>Select time range</option>
            <option value="Less than 5">Less than 5 hours</option>
            <option value="5-10">5-10 hours</option>
            <option value="10-20">10-20 hours</option>
            <option value="20-40">20-40 hours</option>
            <option value="Over 40">Over 40 hours</option>
          </select>
          
          <button 
            className="btn"
            onClick={generateDynamicQuestions}
          >
            Continue
          </button>
          
          <div className="testimonial">
            <div className="testimonial-text">
              "AI now creates 80% of our social media content. We went from posting twice a week to daily, and engagement tripled."
            </div>
            <div className="testimonial-author">
              <div className="profile-image">RT</div>
              <span>- Rachel Thompson, Marketing Manager</span>
            </div>
          </div>
        </div>

        {/* Loading Screen with Video */}
        <div className={`step ${currentStep === 4 ? "active" : ""}`}>
          <div className="loading-container" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "500px",
            padding: "20px"
          }}>
            <div style={{
              position: "relative",
              paddingTop: "56.25%",
              width: "90%",
              maxWidth: "900px",
              margin: "0 auto",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
            }}>
              <iframe 
                src="https://iframe.mediadelivery.net/embed/406789/f7fc57b5-a0a6-45cd-a438-2bf260626b09?autoplay=true&loop=true&muted=true&preload=true&responsive=true" 
                loading="lazy" 
                style={{
                  border: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%"
                }} 
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" 
                allowFullScreen={true}
              />
            </div>
            <div className="loading-text" style={{marginTop: "40px", textAlign: "center"}}>
              {loadingPhase === "questions" ? "Generating your custom questions" : loadingPhase === "report" ? "Deep research for your final report" : "Analyzing Your Business..."}
            </div>
            <div className="loading-subtext" style={{textAlign: "center", maxWidth: "600px", marginTop: "20px"}}>
              {loadingPhase ? (
                <LoadingNarrative
                  lines={loadingPhase === "questions" ? [
                    "Reading your business basics…",
                    "Noting goals and challenges to focus our discovery…",
                    "Checking recent {industry} trends and best practices…",
                    "Looking at tools that fit your current stack…",
                    "Skimming {websiteHost} for extra context…",
                    "Turning findings into tailored, non-generic questions…",
                    "Balancing quick wins with deeper strategy…",
                    "Tightening wording so answers are easy to give…",
                    "Double-checking with fresh sources before finalizing…",
                    "Finalizing your custom questions…",
                  ] : [
                    "Collecting your answers and context…",
                    "Running a deeper web scan for today's {industry} landscape…",
                    "Comparing solutions that match your size and tech stack…",
                    "Estimating effort vs. impact to spot quick wins…",
                    "Drafting an actionable 90-day plan…",
                    "Writing a plain-English executive summary…",
                    "Outlining recommended automations and safeguards…",
                    "Adding competitive and market notes from recent sources…",
                    "Turning insights into step-by-step next actions…",
                    "Packaging everything into your AI Opportunities Report…",
                  ]}
                  ctx={{
                    company: surveyData.companyInfo.companyName || "your business",
                    industry: surveyData.companyInfo.industry || "your industry",
                    websiteURL: surveyData.companyInfo.websiteURL || ""
                  }}
                  intervalMs={loadingPhase === "questions" ? 1800 : 2200}
                />
              ) : (
                "Our AI is performing deep research on your company, industry trends, and competitors to create highly personalized questions"
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Questions Step 1 */}
        <div className={`step ${currentStep === 5 ? "active" : ""}`}>
          <div className="image-container">
            <div className="image-shadow"></div>
            <div className="image-frame">
              <img 
                src="https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91bb03232c933f450f.jpeg" 
                alt="Dynamic Questions"
              />
            </div>
          </div>
          
          <h2>Personalized Questions for Your Business</h2>
          <p>Based on our analysis, we've identified key areas to explore</p>
          
          <div id="dynamicQuestions1">
            {dynamicQuestions.slice(0, Math.ceil(dynamicQuestions.length / 2)).map((q, idx) => (
              <div key={idx} className="question-container">
                <label>{q.text}</label>
                {q.type === "radio" && (
                  <div className="choice-group">
                    {q.options?.map((opt: string) => (
                      <div 
                        key={opt}
                        className={`choice ${surveyData.dynamicQuestions[`q${idx}`] === opt ? "selected" : ""}`}
                        onClick={() => setSurveyData(prev => ({
                          ...prev,
                          dynamicQuestions: { ...prev.dynamicQuestions, [`q${idx}`]: opt }
                        }))}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === "text" && (
                  <input 
                    type="text"
                    value={surveyData.dynamicQuestions[`q${idx}`] || ""}
                    onChange={(e) => setSurveyData(prev => ({
                      ...prev,
                      dynamicQuestions: { ...prev.dynamicQuestions, [`q${idx}`]: e.target.value }
                    }))}
                  />
                )}
                {q.type === "textarea" && (
                  <textarea
                    value={surveyData.dynamicQuestions[`q${idx}`] || ""}
                    onChange={(e) => setSurveyData(prev => ({
                      ...prev,
                      dynamicQuestions: { ...prev.dynamicQuestions, [`q${idx}`]: e.target.value }
                    }))}
                  />
                )}
              </div>
            ))}
          </div>
          
          <button 
            className="btn"
            onClick={() => setCurrentStep(6)}
          >
            Continue
          </button>
        </div>

        {/* Dynamic Questions Step 2 */}
        <div className={`step ${currentStep === 6 ? "active" : ""}`}>
          <div className="image-container">
            <div className="image-shadow"></div>
            <div className="image-frame">
              <img 
                src="https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f91cac6682b0fc37eeb.jpeg" 
                alt="Process Deep Dive"
              />
            </div>
          </div>
          
          <h2>Let's Dive Deeper Into Your Processes</h2>
          <p>These questions help us calculate your potential ROI from AI implementation</p>
          
          <div id="dynamicQuestions2">
            {dynamicQuestions.slice(Math.ceil(dynamicQuestions.length / 2)).map((q, idx) => {
              const actualIdx = idx + Math.ceil(dynamicQuestions.length / 2);
              return (
                <div key={actualIdx} className="question-container">
                  <label>{q.text}</label>
                  {q.type === "radio" && (
                    <div className="choice-group">
                      {q.options?.map((opt: string) => (
                        <div 
                          key={opt}
                          className={`choice ${surveyData.dynamicQuestions[`q${actualIdx}`] === opt ? "selected" : ""}`}
                          onClick={() => setSurveyData(prev => ({
                            ...prev,
                            dynamicQuestions: { ...prev.dynamicQuestions, [`q${actualIdx}`]: opt }
                          }))}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === "text" && (
                    <input 
                      type="text"
                      value={surveyData.dynamicQuestions[`q${actualIdx}`] || ""}
                      onChange={(e) => setSurveyData(prev => ({
                        ...prev,
                        dynamicQuestions: { ...prev.dynamicQuestions, [`q${actualIdx}`]: e.target.value }
                      }))}
                    />
                  )}
                  {q.type === "textarea" && (
                    <textarea
                      value={surveyData.dynamicQuestions[`q${actualIdx}`] || ""}
                      onChange={(e) => setSurveyData(prev => ({
                        ...prev,
                        dynamicQuestions: { ...prev.dynamicQuestions, [`q${actualIdx}`]: e.target.value }
                      }))}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <button 
            className="btn"
            onClick={() => setCurrentStep(7)}
          >
            Continue
          </button>
        </div>

        {/* Final Step: Contact Information */}
        <div className={`step ${currentStep === 7 ? "active" : ""}`}>
          <div className="image-container">
            <div className="image-shadow"></div>
            <div className="image-frame">
              <img 
                src="https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d8f398f0686b47096.jpeg" 
                alt="Final Call to Action"
              />
            </div>
          </div>
          
          <h2>Your AI Transformation Report is Ready!</h2>
          <p>Enter your contact information to receive your personalized AI opportunities report</p>
          
          <form onSubmit={submitLead}>
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              placeholder="First Name" 
              required
              value={surveyData.contactInfo.firstName}
              onChange={(e) => setSurveyData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, firstName: e.target.value }
              }))}
            />
            
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              placeholder="Last Name" 
              required
              value={surveyData.contactInfo.lastName}
              onChange={(e) => setSurveyData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, lastName: e.target.value }
              }))}
            />
            
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="email@company.com" 
              required
              value={surveyData.contactInfo.email}
              onChange={(e) => setSurveyData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, email: e.target.value }
              }))}
            />
            
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              placeholder="(555) 555-5555" 
              required
              value={surveyData.contactInfo.phone}
              onChange={(e) => setSurveyData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, phone: formatPhoneNumber(e.target.value) }
              }))}
            />
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Generating Report..." : "Get My AI Report"}
            </button>
          </form>
          
          <p className="small-text">
            By submitting your information, you agree to receive your personalized AI opportunities report and follow-up consultation. 
            We respect your privacy and will never share your information with third parties.
          </p>
          
          {statusMessage && (
            <div id="statusMessage" className={statusMessage.includes("Success") ? "statusMessage success" : "statusMessage error"}>
              {statusMessage}
            </div>
          )}
        </div>

        {/* Report Display Section */}
        <div className={`step ${currentStep === 8 ? "active" : ""}`}>
          {report && (
            <div className="report-section">
              <div className="report-header">
                <h1 className="report-title">Your AI Opportunities Report</h1>
                <p className="report-subtitle">Personalized recommendations for {surveyData.companyInfo.companyName}</p>
              </div>
              
              <div className="report-content">
                {report.executive_summary && (
                  <>
                    <h2 className="report-section-title">Executive Summary</h2>
                    <div className="report-item">
                      <div className="report-item-description">{report.executive_summary}</div>
                    </div>
                  </>
                )}
                
                {report.quick_wins && report.quick_wins.length > 0 && (
                  <>
                    <h2 className="report-section-title">Quick Wins (Implement in 30 Days)</h2>
                    {report.quick_wins.map((win: any, idx: number) => (
                      <div key={idx} className="report-item">
                        <div className="report-item-title">{win.title}</div>
                        <div className="report-item-description">{win.description}</div>
                      </div>
                    ))}
                  </>
                )}
                
                {report.strategic_recommendations && report.strategic_recommendations.length > 0 && (
                  <>
                    <h2 className="report-section-title">Strategic Recommendations</h2>
                    {report.strategic_recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="report-item">
                        <div className="report-item-title">{rec.title}</div>
                        <div className="report-item-description">{rec.description}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              <button 
                className="btn"
                onClick={async () => {
                  const response = await fetch("/api/report/pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ report, companyInfo: surveyData.companyInfo })
                  });
                  
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `AI_Report_${surveyData.companyInfo.companyName}.pdf`;
                    a.click();
                  }
                }}
              >
                Download Report as PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-bar" id="progressBar"></div>
      </div>
    </>
  );
}