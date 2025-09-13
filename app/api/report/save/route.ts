import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, email, reportData } = body;

    if (!companyName || !email || !reportData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        company_name: companyName,
        email: email,
        report_data: reportData
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      );
    }

    const reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-survey-production.up.railway.app'}/view-report/${data.id}`;

    return NextResponse.json({
      success: true,
      reportId: data.id,
      reportUrl: reportUrl
    });
  } catch (error) {
    console.error('Error saving report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}