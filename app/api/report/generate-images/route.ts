// app/api/report/generate-images/route.ts

import { NextResponse } from 'next/server';
import type { ReportSection } from '@/lib/report-types';

// Get image URLs from environment variables with fallbacks
const getImageUrls = () => {
  return {
    executive: process.env.REPORT_IMAGE_EXECUTIVE || 
      'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f910657f02bf1e88160.jpeg',
    quickWins: process.env.REPORT_IMAGE_QUICKWINS || 
      'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg',
    roadmap: process.env.REPORT_IMAGE_ROADMAP || 
      'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb04c89846a6c43e4fd338.webp',
    competitive: process.env.REPORT_IMAGE_COMPETITIVE || 
      'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d8f398f0686b47096.jpeg',
    implementation: process.env.REPORT_IMAGE_IMPLEMENTATION || 
      'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f910657f02bf1e88160.jpeg',
    fallback: process.env.REPORT_IMAGE_FALLBACK || 
      'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg'
  };
};

// Map section titles to specific images
function getImageForSection(sectionTitle: string): string {
  const images = getImageUrls();
  
  // Map section titles to specific image types
  if (sectionTitle.includes('Executive')) {
    return images.executive;
  } else if (sectionTitle.includes('Quick Win')) {
    return images.quickWins;
  } else if (sectionTitle.includes('Roadmap') || sectionTitle.includes('Strategic')) {
    return images.roadmap;
  } else if (sectionTitle.includes('Competitive')) {
    return images.competitive;
  } else if (sectionTitle.includes('Implementation') || sectionTitle.includes('Your')) {
    return images.implementation;
  } else {
    // Use fallback for any unmatched sections
    return images.fallback;
  }
}

// The POST function handles incoming requests to this endpoint
export async function POST(request: Request) {
  try {
    const { reportData } = await request.json() as { reportData: Omit<ReportSection, 'imageUrl'>[] };

    console.log('Received report data with sections:', reportData?.map(s => s.title));
    
    if (!reportData || !Array.isArray(reportData)) {
      return NextResponse.json({ error: 'Invalid report data provided.' }, { status: 400 });
    }

    // Simply assign the appropriate image URL to each section
    const finalSections: ReportSection[] = reportData.map((section) => ({
      ...section,
      imageUrl: getImageForSection(section.title)
    }));
    
    console.log('Assigned images to all sections');
    
    // Send the complete report data back to the client
    return NextResponse.json({ enhancedReport: finalSections });

  } catch (error) {
    console.error('Error in generate-images API route:', error);
    return NextResponse.json({ error: 'Failed to process the report.' }, { status: 500 });
  }
}