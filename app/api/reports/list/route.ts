import { NextResponse } from "next/server";
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: "Supabase not configured",
        reports: [] 
      }, { status: 200 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('id, company_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ 
        error: error.message,
        reports: [] 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      reports: data || [],
      count: data?.length || 0
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reports',
      reports: [] 
    }, { status: 500 });
  }
}