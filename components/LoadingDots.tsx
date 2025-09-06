export default function LoadingDots() {
  return (
    <div className="flex gap-2 items-center" role="status" aria-label="Loading">
      <span className="animate-pulse">●</span>
      <span className="animate-pulse [animation-delay:150ms]">●</span>
      <span className="animate-pulse [animation-delay:300ms]">●</span>
    </div>
  );
}