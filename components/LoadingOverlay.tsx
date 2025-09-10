import { useState, useEffect } from "react";
import LoadingNarrative from "./LoadingNarrative";

type LoadingOverlayProps = {
  show: boolean;
  phase?: "questions" | "report";
  companyInfo?: {
    companyName?: string;
    industry?: string;
    websiteURL?: string;
  };
  onSkipWait?: () => void;
  contactEmail?: string;
};

export default function LoadingOverlay({ show, phase, companyInfo, onSkipWait, contactEmail }: LoadingOverlayProps) {
  const [showSkipOption, setShowSkipOption] = useState(false);
  
  // Show skip option after 12 seconds when in report phase
  useEffect(() => {
    if (phase === "report" && show) {
      const timer = setTimeout(() => {
        setShowSkipOption(true);
      }, 12000); // 12 seconds delay
      
      return () => clearTimeout(timer);
    } else {
      setShowSkipOption(false);
    }
  }, [phase, show]);
  
  if (!show) return null;

  const questionLines = [
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
  ];

  const reportLines = [
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
  ];

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="loading-overlay">
        <div className="loading-content" style={{ 
        width: '80vw', 
        minWidth: '80vw',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'  // Reduced gap between elements
      }}>
        {/* Show video for both phases - 80% of viewport width */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe 
              src="https://iframe.mediadelivery.net/embed/406789/f7fc57b5-a0a6-45cd-a438-2bf260626b09?autoplay=true&loop=true&muted=false&preload=true&responsive=true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '12px'
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
        
        <div className="loading-text" style={{ 
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          marginBottom: '0'  // Normal spacing
        }}>
          {phase === "questions" ? "Generating your custom questions" : "Deep research for your final report"}
        </div>
        
        {companyInfo && (
          <>
            <div style={{ 
              color: 'white', 
              fontSize: '1.75rem',  // Much smaller than heading
              textShadow: '2px 2px 5px rgba(0,0,0,0.8)', 
              fontWeight: '500',
              lineHeight: '2.25rem',
              marginTop: '0'  // Normal spacing
            }}>
              <LoadingNarrative
                lines={phase === "questions" ? questionLines : reportLines}
                ctx={{
                  company: companyInfo.companyName,
                  industry: companyInfo.industry,
                  websiteURL: companyInfo.websiteURL
                }}
                intervalMs={phase === "questions" ? 1800 : 2200}
              />
            </div>
            
            {phase === "report" && onSkipWait && contactEmail && showSkipOption && (
              <div style={{
                animation: 'fadeIn 0.5s ease-in',
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                  opacity: 0.95,
                  lineHeight: '1.6'
                }}>
                  Can't wait? Click here to receive report by Email,<br/>
                  otherwise hang in there as we dive deep to uncover<br/>
                  the opportunities that can power your growth.
                </p>
                <p style={{
                  color: '#b5feff',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem'
                }}>
                  {contactEmail}
                </p>
                <button
                  onClick={onSkipWait}
                  style={{
                    padding: '0.875rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: '#ff6b11',
                    color: 'white',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(255, 107, 17, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 17, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 17, 0.3)';
                  }}
                >
                  Email Me The Report Instead
                </button>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  marginTop: '1rem',
                  fontStyle: 'italic'
                }}>
                  Your report will continue processing and be emailed within 5 minutes
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}