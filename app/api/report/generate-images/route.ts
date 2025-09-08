
// app/api/report/generate-images/route.ts

import { NextResponse } from 'next/server';
import type { ReportSection } from '@/lib/report-types';

// Ensure the API keys are loaded from environment variables
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set - using placeholder images");
}
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set - using basic prompts");
}

// Helper function to create intelligent image prompts using GPT-5-mini (faster and no rate limits)
async function createIntelligentImagePrompt(section: Omit<ReportSection, 'imageUrl'>): Promise<string> {
  // Check if OpenAI API key is available for intelligent prompts
  if (!process.env.OPENAI_API_KEY) {
    // Fallback to the basic prompt if no API key
    return section.imagePrompt || `Professional visualization for ${section.title}`;
  }

  try {
    // Use GPT-5-mini via Responses API to analyze content and create image prompts
    const apiUrl = 'https://api.openai.com/v1/responses';
    
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

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: analysisPrompt,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      const intelligentPrompt = data.output || section.imagePrompt || `Professional visualization for ${section.title}`;
      
      // Add our styling preferences to the intelligent prompt
      return `${intelligentPrompt}. Style: Modern professional business visualization with brand colors blue (#08b2c6), teal (#b5feff), and orange (#ff6b11) accents. Clean, minimalist, suitable for corporate report. No text or words in image.`;
    } else {
      const errorText = await response.text();
      console.error('GPT-5-mini prompt generation failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('Failed to generate intelligent prompt with GPT-5-mini:', error);
  }
  
  // Fallback to original prompt
  return section.imagePrompt || `Professional visualization for ${section.title}`;
}

// Generate image using Gemini 2.5 Flash Image Preview
// Note: This function now ONLY uses Gemini for actual image generation.
// Prompt creation has been offloaded to GPT-5-mini to avoid Gemini rate limits.
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
    // First, get an intelligent prompt based on the actual content (using GPT-5-mini)
    const intelligentPrompt = await createIntelligentImagePrompt(section);
    
    console.log(`[GPT-5-mini] Created prompt for: ${section.title}`);
    console.log(`[Gemini] Generating image with prompt: ${intelligentPrompt.slice(0, 100)}...`);
    
    // Now use the image generation endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const promptText = intelligentPrompt;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini 2.5 Flash Image Preview API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Image generation failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response structure:', JSON.stringify(data, null, 2).substring(0, 500));
    
    // Extract image from the response structure
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const parts = data.candidates[0].content.parts;
      
      // Find the image part in the response
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
          console.log(`[Gemini] Successfully generated image for: ${section.title}`);
          // Return as base64 data URL
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn(`[Gemini] No image found in response for: ${section.title}`, {
      hasCandidate: !!data.candidates?.[0],
      hasContent: !!data.candidates?.[0]?.content,
      hasParts: !!data.candidates?.[0]?.content?.parts,
      partsLength: data.candidates?.[0]?.content?.parts?.length || 0
    });
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
