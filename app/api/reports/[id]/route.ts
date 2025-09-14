import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[Reports API] Starting request');
  
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const resolvedParams = await params;
    const reportId = resolvedParams.id;
    console.log('[Reports API] Report ID:', reportId);
    
    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    // Check if Supabase is configured
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('[Reports API] Supabase config:', { hasUrl, hasKey });
    
    if (!hasUrl || !hasKey) {
      console.error('[Reports API] Missing Supabase config');
      return NextResponse.json({ 
        error: "Supabase not configured",
        details: { hasUrl, hasKey }
      }, { status: 503 });
    }

    console.log('[Reports API] Connecting to Supabase...');
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('[Reports API] Fetching report from database...');
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    console.log('[Reports API] Query result:', { 
      hasData: !!data, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error || !data) {
      console.error('[Reports API] Error fetching report:', error);
      return NextResponse.json({ 
        error: 'Report not found',
        details: error?.message || 'No data returned',
        reportId
      }, { status: 404 });
    }

    // Check data structure
    console.log('[Reports API] Data structure:', {
      hasReportData: !!data.report_data,
      hasHtmlReport: !!data.report_data?.htmlReport,
      htmlLength: data.report_data?.htmlReport?.length || 0,
      reportDataKeys: data.report_data ? Object.keys(data.report_data) : []
    });
    
    // Return the full HTML if available
    if (data.report_data?.htmlReport) {
      console.log('[Reports API] Returning HTML report');
      return new NextResponse(data.report_data.htmlReport, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    console.log('[Reports API] No HTML found, returning JSON');
    return NextResponse.json({ 
      error: 'HTML report not found in data',
      reportId,
      hasReportData: !!data.report_data,
      hasHtmlReport: !!data.report_data?.htmlReport,
      reportDataKeys: data.report_data ? Object.keys(data.report_data) : []
    }, { status: 404 });
    
  } catch (error: any) {
    console.error('[Reports API] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch report',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}