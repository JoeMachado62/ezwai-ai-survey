export default function HomePage() {
  // Simple page that returns a 200 status for health checks
  // The actual survey is at /embed
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#08b2c6' }}>
        EZWAI AI Survey
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
        AI Opportunities Assessment Platform
      </p>
      <a 
        href="/embed" 
        style={{
          padding: '12px 24px',
          backgroundColor: '#ff6b11',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          transition: 'opacity 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
      >
        Start Survey
      </a>
      <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: '#999' }}>
        Status: Healthy ✓
      </p>
    </div>
  );
}