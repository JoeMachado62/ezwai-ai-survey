import { NextRequest, NextResponse } from 'next/server';
import { generateRailwayPdfBuffer } from '@/lib/generateRailwayPdf';
import type { ReportSection } from '@/lib/report-types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sections, businessName } = body as { sections: ReportSection[], businessName: string };
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing sections data' },
        { status: 400 }
      );
    }
    
    console.log(`[PDF Generation] Creating Railway-compatible PDF for ${businessName} with ${sections.length} sections`);
    
    // Generate PDF buffer using Railway-compatible renderer
    const pdfBuffer = await generateRailwayPdfBuffer(
      sections,
      businessName || 'Your Business'
    );
    
    // Convert buffer to base64
    const base64 = pdfBuffer.toString('base64');
    
    console.log(`[PDF Generation] Successfully generated PDF (${Math.round(base64.length / 1024)}KB)`);
    
    return NextResponse.json({
      success: true,
      pdfBase64: base64
    });
    
  } catch (error) {
    console.error('[PDF Generation] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}