export default function StepCard({ 
  title, 
  subtitle, 
  children 
}: { 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode 
}) {
  return (
    <section className="container-ez my-6">
      <div className="card-ez">
        <h2 className="step-title">{title}</h2>
        {subtitle && <p className="step-sub">{subtitle}</p>}
        <div>{children}</div>
      </div>
    </section>
  );
}
