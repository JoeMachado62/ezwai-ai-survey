// Simple in-memory rate limiter per-IP (best-effort in serverless)
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRate(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(ip);
  
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  
  if (bucket.count >= limit) {
    return { allowed: false };
  }
  
  bucket.count += 1;
  return { allowed: true };
}

// Clean up old buckets periodically (optional)
setInterval(() => {
  const now = Date.now();
  Array.from(buckets.entries()).forEach(([ip, bucket]) => {
    if (bucket.resetAt < now) {
      buckets.delete(ip);
    }
  });
}, 60_000);
