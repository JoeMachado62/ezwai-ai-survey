
// app/api/report/generate-images/route.ts

import { NextResponse } from 'next/server';
import type { ReportSection } from '@/lib/report-types';

// Ensure the API key is loaded from environment variables
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set - using placeholder images");
}

// Generate image using Gemini 2.5 Flash Image Preview
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
    console.log('Gemini API key not configured, using placeholders');
    const index = section.title.length % placeholderImages.length;
    return placeholderImages[index];
  }

  try {
    // Use Gemini 2.5 Flash Image Preview for actual image generation
    console.log(`Generating image for: ${section.title}`);
    
    // Construct the proper API endpoint for Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a professional business visualization for: ${section.imagePrompt}. 
                   Style: Modern, professional, abstract business imagery with a color palette of deep blues (#08b2c6), teal (#b5feff), and accent orange (#ff6b11). 
                   Clean, minimalist design suitable for a corporate report. 
                   No text or words in the image, only visual elements.
                   High quality, detailed, photorealistic rendering.`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
        // Critical: Tell Gemini to return an image
        config: {
          responseModalities: ["IMAGE", "TEXT"]
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini 2.5 Flash Image Preview API error:', error);
      throw new Error('Image generation failed');
    }

    const data = await response.json();
    
    // Extract image from the response structure
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const parts = data.candidates[0].content.parts;
      
      // Find the image part in the response
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
          console.log(`Successfully generated image for: ${section.title}`);
          // Return as base64 data URL
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn(`No image found in Gemini response for: ${section.title}`);
    throw new Error('No image in response');
    
  } catch (error) {
    console.error(`Error generating image for section "${section.title}":`, error);
    // Return a fallback image on error
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
