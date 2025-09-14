import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  console.log('[Test Report] Starting diagnostic test...');
  
  try {
    // Step 1: Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET'
    };
    
    console.log('[Test Report] Environment check:', envCheck);
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        step: 'Environment Check',
        error: "Supabase not configured",
        env: envCheck
      }, { status: 503 });
    }

    // Step 2: Try to create Supabase client
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
      console.log('[Test Report] Supabase client created successfully');
    } catch (err: any) {
      console.error('[Test Report] Failed to create Supabase client:', err);
      return NextResponse.json({ 
        step: 'Client Creation',
        error: 'Failed to create Supabase client',
        details: err.message
      }, { status: 500 });
    }
    
    // Step 3: Try to fetch the specific report
    const testReportId = 'dfc2f3e7-e270-4c5f-bf48-855ebd95f088';
    console.log('[Test Report] Fetching report:', testReportId);
    
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('id, company_name, created_at')
      .eq('id', testReportId)
      .single();

    console.log('[Test Report] Query result:', { hasData: !!data, hasError: !!error });

    if (error) {
      console.error('[Test Report] Database error:', error);
      return NextResponse.json({ 
        step: 'Database Query',
        error: 'Database error',
        details: error.message,
        code: error.code,
        reportId: testReportId
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        step: 'Report Lookup',
        error: 'Report not found',
        reportId: testReportId
      }, { status: 404 });
    }

    // Step 4: Check full data structure
    console.log('[Test Report] Fetching full report data...');
    const { data: fullData, error: fullError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', testReportId)
      .single();

    if (fullError) {
      console.error('[Test Report] Error fetching full data:', fullError);
    }
    
    // Analyze the data structure
    const analysis = {
      id: data.id,
      company_name: data.company_name,
      created_at: data.created_at,
      hasReportData: !!fullData?.report_data,
      reportDataType: typeof fullData?.report_data,
      reportDataKeys: fullData?.report_data ? Object.keys(fullData.report_data) : [],
      hasHtmlReport: !!fullData?.report_data?.htmlReport,
      htmlLength: fullData?.report_data?.htmlReport?.length || 0,
      hasPdfUrl: !!fullData?.pdf_url,
      pdfUrlValue: fullData?.pdf_url || 'NULL',
      // Check if it's stored differently
      hasHtml: !!fullData?.html,
      hasReportHtml: !!fullData?.report_html,
      allColumns: fullData ? Object.keys(fullData) : []
    };
    
    console.log('[Test Report] Analysis complete:', analysis);

    return NextResponse.json({ 
      success: true,
      step: 'Complete Analysis',
      report: analysis,
      routes: {
        viewReport: `/view-report/${testReportId}`,
        apiReport: `/api/reports/${testReportId}`,
        rReport: `/r/${testReportId}`
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Server error',
      message: error.message
    }, { status: 500 });
  }
}