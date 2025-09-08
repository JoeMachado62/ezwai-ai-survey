import LoadingNarrative from "./LoadingNarrative";

type LoadingOverlayProps = {
  show: boolean;
  phase?: "questions" | "report";
  companyInfo?: {
    companyName?: string;
    industry?: string;
    websiteURL?: string;
  };
};

export default function LoadingOverlay({ show, phase, companyInfo }: LoadingOverlayProps) {
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
    <div className="loading-overlay">
      <div className="loading-content" style={{ 
        width: '80vw', 
        minWidth: '80vw',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
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
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {phase === "questions" ? "Generating your custom questions" : "Deep research for your final report"}
        </div>
        
        {companyInfo && (
          <div style={{ color: 'white', fontSize: '1.25rem', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
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
        )}
      </div>
    </div>
  );
}