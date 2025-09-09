// app/api/report/generate-images/route.ts

import { NextResponse } from 'next/server';
import type { ReportSection } from '@/lib/report-types';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

// Ensure the API keys are loaded from environment variables
if (!process.env.RUNWARE_API_KEY) {
  console.warn("RUNWARE_API_KEY not set - using placeholder images");
}
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set - using basic prompts");
}

// Helper function to create intelligent image prompts using GPT-4o-mini
async function createIntelligentImagePrompt(section: Omit<ReportSection, 'imageUrl'>): Promise<string> {
  // Check if OpenAI API key is available for intelligent prompts
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to the basic prompt if no API key
    return section.imagePrompt || `Professional visualization for ${section.title}`;
  }

  try {
    // Use GPT-4o-mini via Responses API to analyze content and create image prompts
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
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
      console.error('GPT-4o-mini prompt generation failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('Failed to generate intelligent prompt with GPT-4o-mini:', error);
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
    
    console.log(`[GPT-4o-mini] Created prompt for: ${section.title}`);
    console.log(`[Runware] Generating image with prompt: ${intelligentPrompt.slice(0, 100)}...`);
    
    // Now use the Runware image generation endpoint
    const apiUrl = 'https://api.runware.ai/v1/tasks';
    const headers = {
      'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify([
      {
        "taskType": "imageInference",
        "model": "runware:101@1",
        "numberResults": 1,
        "outputFormat": "JPEG",
        "width": 1536,
        "height": 640,
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
    const taskId = data[0].taskId;

    if (!taskId) {
      throw new Error('No taskId in Runware response');
    }

    // Polling for the result
    const pollUrl = `https://api.runware.ai/v1/tasks/${taskId}`;
    for (let i = 0; i < 20; i++) { // Poll for a maximum of 20 times (e.g., 1 minute)
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      const pollResponse = await fetch(pollUrl, { headers });
      if ( pollResponse.ok) {
        const result = await pollResponse.json();
        if (result.status === 'COMPLETED') {
          console.log("[Runware] API response:", result);
          const imageUrl = result.output?.files?.[0]?.url;
          if (imageUrl) {
            console.log(`[Runware] Successfully generated image for: ${section.title}`);
            return imageUrl;
          } else {
            console.warn(`[Runware] No image URL in response for: ${section.title}`, result);
            throw new Error('No image URL in Runware response');
          }
        } else if (result.status === 'FAILED') {
          console.error(`[Runware] Image generation failed for task ${taskId}`, result);
          throw new Error('Runware task failed');
        }
      }
    }
    throw new Error('Polling for Runware task timed out');

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