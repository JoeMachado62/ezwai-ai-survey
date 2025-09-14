import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    
    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: "Supabase not configured"
      }, { status: 503 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !data) {
      console.error('Error fetching report:', error);
      return NextResponse.json({ 
        error: 'Report not found'
      }, { status: 404 });
    }

    // Return the full HTML if available
    if (data.report_data?.htmlReport) {
      return new NextResponse(data.report_data.htmlReport, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    return NextResponse.json({ 
      report: data,
      hasHtml: !!data.report_data?.htmlReport
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch report'
    }, { status: 500 });
  }
}