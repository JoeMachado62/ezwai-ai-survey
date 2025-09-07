import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRate } from "@/lib/rateLimit";

const InZ = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  companyInfo: z.record(z.any()),
  techStack: z.record(z.any()),
  socialMedia: z.record(z.any()),
  answers: z.record(z.any()),
  report: z.record(z.any())
});

async function ghlFetch(path: string, init: RequestInit) {
  const url = `https://services.leadconnectorhq.com${path}`;
  const headers = {
    Authorization: `Bearer ${process.env.GHL_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    Version: "2021-07-28",
    ...(process.env.GHL_LOCATION_ID ? { LocationId: process.env.GHL_LOCATION_ID } : {})
  } as Record<string, string>;
  return fetch(url, { ...init, headers: { ...headers, ...(init.headers as any || {}) } });
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  if (!checkRate(ip).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Check if GHL credentials are configured
  if (!process.env.GHL_TOKEN || !process.env.GHL_LOCATION_ID) {
    console.error("GHL credentials missing:", {
      hasToken: !!process.env.GHL_TOKEN,
      hasLocationId: !!process.env.GHL_LOCATION_ID
    });
    // Return success to not block the user flow
    return NextResponse.json({ 
      ok: true, 
      contactId: "mock-" + Date.now(),
      warning: "GHL integration not configured" 
    }, { status: 200 });
  }

  try {
    const inb = InZ.parse(await req.json());

    // Create contact
    const create = await ghlFetch("/contacts/", {
      method: "POST",
      body: JSON.stringify({
        locationId: process.env.GHL_LOCATION_ID,
        firstName: inb.firstName,
        lastName: inb.lastName,
        email: inb.email,
        phone: inb.phone,
        tags: inb.tags || []
      })
    });

    if (!create.ok) {
      const t = await create.text();
      console.error(`GHL API error ${create.status}:`, t);
      
      // If authentication fails, don't block the user
      if (create.status === 401) {
        console.error("GHL authentication failed - token may be expired or invalid");
        return NextResponse.json({ 
          ok: true, 
          contactId: "auth-failed-" + Date.now(),
          warning: "GHL authentication failed - contact not created" 
        }, { status: 200 });
      }
      
      throw new Error(`GHL create ${create.status}: ${t}`);
    }
    
    const cj = await create.json();
    const contactId = cj?.contact?.id;
    if (!contactId) throw new Error("No contactId returned");

    // Create note with survey and report
    const noteBody = [
      "AI ASSESSMENT — Survey Input",
      "```json",
      JSON.stringify({ 
        companyInfo: inb.companyInfo, 
        techStack: inb.techStack, 
        socialMedia: inb.socialMedia, 
        answers: inb.answers 
      }, null, 2),
      "```",
      "",
      "AI OPPORTUNITIES — Report",
      "```json",
      JSON.stringify(inb.report, null, 2),
      "```"
    ].join("\n");

    const note = await ghlFetch(`/contacts/${contactId}/notes`, {
      method: "POST",
      body: JSON.stringify({ body: noteBody, contactId })
    });

    if (!note.ok) {
      const t = await note.text();
      throw new Error(`GHL note ${note.status}: ${t}`);
    }

    return NextResponse.json({ ok: true, contactId }, { status: 200 });
  } catch (e: any) {
    console.error("GHL API error:", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
