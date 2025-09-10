"use client";
import { useEffect, useMemo, useState } from "react";

type Ctx = { company?: string; industry?: string; websiteURL?: string };

export default function LoadingNarrative({
  lines,
  ctx,
  intervalMs = 1800,
}: { lines: string[]; ctx: Ctx; intervalMs?: number }) {
  const [i, setI] = useState(0);
  const websiteHost = useMemo(() => {
    try { 
      return ctx.websiteURL ? new URL(ctx.websiteURL).host.replace(/^www\./,'') : ""; 
    } catch { 
      return ""; 
    }
  }, [ctx.websiteURL]);

  const resolved = useMemo(() => lines
    .filter(l => websiteHost ? true : !/\{websiteHost\}/.test(l))
    .map(l => l.replace(/{company}/g, ctx.company || "your business")
               .replace(/{industry}/g, ctx.industry || "your industry")
               .replace(/{websiteHost}/g, websiteHost || "")),
  [lines, ctx.company, ctx.industry, websiteHost]);

  useEffect(() => {
    if (!resolved.length) return;
    const id = setInterval(() => setI(v => (v + 1) % resolved.length), intervalMs);
    return () => clearInterval(id);
  }, [resolved, intervalMs]);

  return (
    <div className="loading-narrative-text" key={i}>
      {resolved[i]}
    </div>
  );
}