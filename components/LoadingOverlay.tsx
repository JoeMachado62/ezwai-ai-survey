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
      <div className="loading-content">
        {/* Show video for both phases */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '560px', margin: '0 auto 30px' }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe 
              src="https://www.youtube.com/embed/hTbtSjNPsUk?autoplay=1&mute=1&loop=1&playlist=hTbtSjNPsUk&controls=0&showinfo=0&rel=0&modestbranding=1" 
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
        
        <div className="loading-text" style={{ marginBottom: '15px' }}>
          {phase === "questions" ? "Generating your custom questions" : "Deep research for your final report"}
        </div>
        
        {companyInfo && (
          <LoadingNarrative
            lines={phase === "questions" ? questionLines : reportLines}
            ctx={companyInfo}
            intervalMs={phase === "questions" ? 1800 : 2200}
          />
        )}
      </div>
    </div>
  );
}