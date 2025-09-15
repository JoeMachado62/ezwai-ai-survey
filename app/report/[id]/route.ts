import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from '@/lib/supabase';

// Direct server-side HTML route - no client JavaScript needed
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Direct Report Route] Starting request');
  
  try {
    // Next.js 14 - params are directly accessible
    const reportId = params.id;
    console.log('[Direct Report Route] Report ID:', reportId);
    
    if (!reportId) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html><body>
        <h1>Error: Report ID required</h1>
        </body></html>`,
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Direct Report Route] Supabase not configured');
      return new NextResponse(
        `<!DOCTYPE html>
        <html><body>
        <h1>Error: Database not configured</h1>
        </body></html>`,
        { 
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !data) {
      console.error('[Direct Report Route] Error:', error);
      return new NextResponse(
        `<!DOCTYPE html>
        <html><body>
        <h1>Report Not Found</h1>
        <p>Report ID: ${reportId}</p>
        <p>Error: ${error?.message || 'No data returned'}</p>
        </body></html>`,
        { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Get the HTML content
    const htmlReport = data.report_data?.htmlReport;
    
    if (!htmlReport) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html><body>
        <h1>Report HTML Not Available</h1>
        <p>Report exists but HTML content is missing</p>
        <p>Report ID: ${reportId}</p>
        <p>Company: ${data.company_name}</p>
        </body></html>`,
        { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Ensure complete HTML document
    let finalHtml = htmlReport;
    if (!finalHtml.includes('<!DOCTYPE html>')) {
      finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Opportunities Report - ${data.company_name || 'Company'}</title>
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${finalHtml}
</body>
</html>`;
    }

    // Return the complete HTML document
    return new NextResponse(finalHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
    
  } catch (error: any) {
    console.error('[Direct Report Route] Unexpected error:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html><body>
      <h1>Server Error</h1>
      <p>${error.message}</p>
      </body></html>`,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}