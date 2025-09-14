import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import ViewReportClient from './ViewReportClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ViewReportPage({ params }: { params: { id: string } }) {
  const reportId = params.id;
  
  if (!reportId) {
    notFound();
  }

  // Use server-side Supabase admin client
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[ViewReport] Supabase not configured');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
            <p className="text-gray-600">Report viewing requires database configuration.</p>
            <p className="text-sm text-gray-500 mt-2">Please contact support.</p>
          </div>
        </div>
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !data) {
      console.error('[ViewReport] Report not found:', error);
      notFound();
    }

    // Update access tracking
    await supabaseAdmin
      .from('reports')
      .update({
        accessed_at: new Date().toISOString(),
        access_count: (data.access_count || 0) + 1
      })
      .eq('id', reportId);

    const reportData = data.report_data;

    if (!reportData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <p className="text-gray-600">No report data available</p>
          </div>
        </div>
      );
    }

    // Render the client component with the fetched data
    return <ViewReportClient reportData={reportData} reportId={reportId} />;

  } catch (err) {
    console.error('[ViewReport] Error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">Failed to load report</p>
          <p className="text-xs text-gray-400 mt-4">Report ID: {reportId}</p>
        </div>
      </div>
    );
  }
}