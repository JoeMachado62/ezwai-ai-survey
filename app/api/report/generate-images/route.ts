
// app/api/report/generate-images/route.ts

import { NextResponse } from 'next/server';
import type { ReportSection } from '@/lib/report-types';

// Ensure the API key is loaded from environment variables
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set - using placeholder images");
}

// Generate image using Gemini API
async function generateImageForSection(section: Omit<ReportSection, 'imageUrl'>): Promise<string> {
  // Fallback images if API is not configured
  const placeholderImages = [
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f910657f02bf1e88160.jpeg',
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg',
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb04c89846a6c43e4fd338.webp',
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d8f398f0686b47096.jpeg'
  ];

  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    const index = section.title.length % placeholderImages.length;
    return placeholderImages[index];
  }

  try {
    // Call Gemini API using the Vertex AI REST endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional business visualization for: ${section.imagePrompt}. Style: Modern, professional, abstract business imagery with blue and teal color scheme.`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    
    // For text-to-image, we'd need to use a different endpoint or service
    // For now, return a placeholder as Gemini doesn't directly generate images
    // You would integrate with Imagen API or similar here
    console.log('Gemini response received, using placeholder image');
    const index = section.title.length % placeholderImages.length;
    return placeholderImages[index];
    
  } catch (error) {
    console.error(`Error calling Gemini API for section "${section.title}":`, error);
    const index = section.title.length % placeholderImages.length;
    return placeholderImages[index];
  }
}

// The POST function handles incoming requests to this endpoint
export async function POST(request: Request) {
  try {
    const { reportData } = await request.json() as { reportData: Omit<ReportSection, 'imageUrl'>[] };

    if (!reportData || !Array.isArray(reportData)) {
      return NextResponse.json({ error: 'Invalid report data provided.' }, { status: 400 });
    }

    // Generate all images in parallel for maximum speed
    const imageGenerationPromises = reportData.map(async (section) => {
      try {
        const imageUrl = await generateImageForSection(section);
        return imageUrl;
      } catch (error) {
        console.error(`Error generating image for section "${section.title}":`, error);
        // Return a fallback image on error to prevent the whole report from failing
        return 'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f910657f02bf1e88160.jpeg';
      }
    });

    const generatedImageUrls = await Promise.all(imageGenerationPromises);

    // Combine the original section data with the new image URLs
    const finalSections: ReportSection[] = reportData.map((section, index) => ({
      ...section,
      imageUrl: generatedImageUrls[index],
    }));
    
    // Send the complete report data back to the client
    return NextResponse.json({ enhancedReport: finalSections });

  } catch (error) {
    console.error('Error in generate-images API route:', error);
    return NextResponse.json({ error: 'Failed to process the report.' }, { status: 500 });
  }
}
