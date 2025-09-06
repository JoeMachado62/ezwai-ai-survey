export default function LoadingOverlay({ show, message }: { show: boolean; message?: string }) {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-text">Analyzing Your Business...</div>
        {message && (
          <div className="loading-subtext">{message}</div>
        )}
      </div>
    </div>
  );
}