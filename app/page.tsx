import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-5xl font-bold mb-4" style={{ color: '#08b2c6' }}>
        EZWAI AI Survey
      </h1>
      <p className="text-xl mb-8 text-gray-600">
        AI Opportunities Assessment Platform
      </p>
      <Link 
        href="/embed"
        className="px-8 py-4 text-lg font-bold text-white rounded-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#ff6b11' }}
      >
        Start Survey
      </Link>
      <div className="mt-12 text-sm text-gray-400">
        <p>Status: Ready ✓</p>
        <p className="mt-2">Railway Deployment Active</p>
      </div>
    </div>
  );
}