// app/api/report/generate-images/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import type { ReportSection } from '@/lib/report-types';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

// Ensure the API keys are loaded from environment variables
if (!process.env.RUNWARE_API_KEY) {
  console.warn("RUNWARE_API_KEY not set - using placeholder images");
}
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set - using basic prompts");
}

// Helper function to create intelligent image prompts using gpt-5-mini
async function createIntelligentImagePrompt(section: Omit<ReportSection, 'imageUrl'>): Promise<string> {
  // Check if OpenAI API key is available for intelligent prompts
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to the basic prompt if no API key
    return section.imagePrompt || `Professional visualization for ${section.title}`;
  }

  try {
    // Use gpt-5-mini via Responses API to analyze content and create image prompts
    const analysisPrompt = `Analyze this business report section and create a detailed image generation prompt:

SECTION TITLE: ${section.title}

CONTENT: ${section.mainContent.slice(0, 1000)}

KEY TAKEAWAYS: ${section.keyTakeaways?.join(', ') || 'None'}

TASK: Create a detailed, specific image generation prompt that:
1. Captures the main concepts and themes from this section
2. Suggests specific visual metaphors or symbols that represent the ideas
3. Avoids generic business imagery
4. Is suitable for AI image generation

Return ONLY the image prompt, nothing else. Make it detailed and specific.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: analysisPrompt
      })
    });

    if (response.ok) {
      const data = await response.json();
      const intelligentPrompt = data.output || section.imagePrompt || `Professional visualization for ${section.title}`;
      console.log("Generated prompt:", intelligentPrompt);
      
      // Add our styling preferences to the intelligent prompt
      return `${intelligentPrompt}. Style: Modern professional business visualization with brand colors blue (#08b2c6), teal (#b5feff), and orange (#ff6b11) accents. Clean, minimalist, suitable for corporate report. No text or words in image.`;
    } else {
      const errorText = await response.text();
      console.error('gpt-5-mini prompt generation failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('Failed to generate intelligent prompt with gpt-5-mini:', error);
  }
  
  // Fallback to original prompt
  return section.imagePrompt || `Professional visualization for ${section.title}`;
}

// Generate image using Runware Flux 1 Dev
async function generateImageForSection(section: Omit<ReportSection, 'imageUrl'>): Promise<string> {
  // Fallback images if API is not configured
  const placeholderImages = [
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687a3f910657f02bf1e88160.jpeg',
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687915b96ccf5645dba7e085.jpeg',
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/68bb04c89846a6c43e4fd338.webp',
    'https://storage.googleapis.com/msgsndr/6LvSeUzOMEkQrC9oF5AI/media/687bcc9d8f398f0686b47096.jpeg'
  ];

  // Check if Runware API key is configured
  if (!process.env.RUNWARE_API_KEY || process.env.RUNWARE_API_KEY === 'your_runware_api_key_here') {
    console.log('Runware API key not configured, using placeholders');
    const index = section.title.length % placeholderImages.length;
    return placeholderImages[index];
  }

  try {
    // First, get an intelligent prompt based on the actual content
    const intelligentPrompt = await createIntelligentImagePrompt(section);
    
    console.log(`[gpt-5-mini] Created prompt for: ${section.title}`);
    console.log(`[Runware] Generating image with prompt: ${intelligentPrompt.slice(0, 100)}...`);
    
    // Generate a UUID for this task
    const taskUUID = crypto.randomUUID();
    
    // Now use the Runware image generation endpoint
    const apiUrl = 'https://api.runware.ai/v1/tasks';
    const headers = {
      'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`,
      'Content-Type': 'application/json',
    };
    // 21:9 aspect ratio calculation
    // 21:9 = 2.333... ratio
    // Using 1344x576 (both multiples of 64, within API limits)
    // 1344 / 576 = 2.333... which is exactly 21:9
    const body = JSON.stringify([
      {
        "taskType": "imageInference",
        "taskUUID": taskUUID,
        "model": "runware:101@1",
        "numberResults": 1,
        "outputFormat": "JPEG",
        "width": 1344,
        "height": 576,
        "steps": 28,
        "CFGScale": 3.5,
        "scheduler": "FlowMatchEulerDiscreteScheduler",
        "includeCost": true,
        "outputType": ["URL"],
        "outputQuality": 85,
        "positivePrompt": intelligentPrompt
      }
    ]);

    const response = await fetch(apiUrl, { method: 'POST', headers, body });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Runware API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Image generation failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("[Runware] API response:", data);
    
    // The image URL is returned immediately in the response
    const imageUrl = data?.data?.[0]?.imageURL;
    
    if (imageUrl) {
      console.log(`[Runware] Successfully generated image for: ${section.title}`);
      console.log(`[Runware] Image URL: ${imageUrl}`);
      return imageUrl;
    } else {
      console.error("Runware response did not include an imageURL:", data);
      throw new Error('No imageURL in Runware response');
    }

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

    console.log('Received report data with sections:', reportData?.map(s => s.title));
    
    if (!reportData || !Array.isArray(reportData)) {
      return NextResponse.json({ error: 'Invalid report data provided.' }, { status: 400 });
    }

    const startTime = Date.now();
    console.log(`[Image Generation] Starting generation for ${reportData.length} sections...`);

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

    // Wait for ALL images to be generated before proceeding
    const generatedImageUrls = await Promise.all(imageGenerationPromises);
    
    const endTime = Date.now();
    console.log(`[Image Generation] Completed all ${reportData.length} images in ${(endTime - startTime) / 1000}s`);

    // Combine the original section data with the new image URLs
    const finalSections: ReportSection[] = reportData.map((section, index) => ({
      ...section,
      imageUrl: generatedImageUrls[index],
    }));
    
    console.log(`[Image Generation] Returning enhanced report with all images`);
    
    // Send the complete report data back to the client
    return NextResponse.json({ enhancedReport: finalSections });

  } catch (error) {
    console.error('Error in generate-images API route:', error);
    return NextResponse.json({ error: 'Failed to process the report.' }, { status: 500 });
  }
}