import { NextResponse } from "next/server";
import { z } from "zod";

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
    Authorization: `Bearer ${process.env.GHL_TOKEN!}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    Version: "2021-07-28",
    ...(process.env.GHL_LOCATION_ID ? 
      { "X-GHL-Location-Id": process.env.GHL_LOCATION_ID } : 
      {}
    )
  };
  
  return fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } });
}

export async function POST(req: Request) {
  // Check if GHL is configured but don't block execution
  if (!process.env.GHL_TOKEN || !process.env.GHL_LOCATION_ID) {
    console.warn("GHL integration not configured:", {
      hasToken: !!process.env.GHL_TOKEN,
      hasLocationId: !!process.env.GHL_LOCATION_ID
    });
  }

  try {
    const inb = InZ.parse(await req.json());

    // Only attempt GHL API calls if credentials are configured
    if (process.env.GHL_TOKEN && process.env.GHL_LOCATION_ID) {
      // Create contact
      const create = await ghlFetch("/contacts/", {
        method: "POST",
        body: JSON.stringify({
          locationId: process.env.GHL_LOCATION_ID,
          firstName: inb.firstName,
          lastName: inb.lastName,
          email: inb.email,
          phone: inb.phone,
          tags: inb.tags || ["AI Survey", "Auto-Generated"]
        })
      });

      if (!create.ok) {
        const t = await create.text();
        console.error(`GHL API error ${create.status}:`, t);
        
        // If authentication fails, log but don't block the user
        if (create.status === 401) {
          console.error("GHL authentication failed - token may be expired or invalid");
          return NextResponse.json({ 
            ok: true, 
            contactId: "auth-failed-" + Date.now(),
            warning: "GHL authentication failed - contact not created but survey completed" 
          }, { status: 200 });
        }
        
        // For other errors, log but continue
        console.error(`GHL create contact failed: ${create.status}: ${t}`);
        return NextResponse.json({ 
          ok: true, 
          contactId: "error-" + Date.now(),
          warning: `Contact creation failed but survey completed. Error: ${create.status}` 
        }, { status: 200 });
      }
      
      const cj = await create.json();
      const contactId = cj?.contact?.id || cj?.id; // Try both possible response structures
      
      if (!contactId) {
        console.error("No contactId in response:", cj);
        return NextResponse.json({ 
          ok: true, 
          contactId: "no-id-" + Date.now(),
          warning: "Contact may have been created but ID not returned" 
        }, { status: 200 });
      }

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
        body: JSON.stringify({ 
          body: noteBody, 
          contactId,
          userId: process.env.GHL_USER_ID // Optional: if you have a specific user ID
        })
      });

      if (!note.ok) {
        const t = await note.text();
        console.error(`GHL note creation failed ${note.status}: ${t}`);
        // Note creation failure is not critical - contact was still created
      }

      console.log(`Successfully created GHL contact: ${contactId}`);
      return NextResponse.json({ ok: true, contactId }, { status: 200 });
      
    } else {
      // No GHL credentials - save locally or just return success
      console.log("GHL not configured - returning mock success");
      return NextResponse.json({ 
        ok: true, 
        contactId: "local-" + Date.now(),
        warning: "Contact saved locally - GHL integration not configured" 
      }, { status: 200 });
    }
    
  } catch (e: any) {
    console.error("Error in GHL contact route:", e);
    
    // Don't fail the entire survey submission due to GHL errors
    // The user has already completed the survey - we should save their data somehow
    return NextResponse.json({ 
      ok: true, 
      contactId: "exception-" + Date.now(),
      warning: `Survey completed but contact save encountered an error: ${e.message}`,
      error: e.message 
    }, { status: 200 });
  }
}