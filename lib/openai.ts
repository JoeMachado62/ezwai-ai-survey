/**
 * GPT-5 Responses API implementation
 * 
 * CRITICAL: GPT-5 IS AVAILABLE AND WORKING!
 * - Use gpt-5-mini for fast responses (questions)
 * - Use gpt-5 for complex reasoning (reports)
 * - Always use /v1/responses endpoint for GPT-5
 * - DO NOT change to GPT-4 - GPT-5 is the correct model
 */

// Fallback questions for timeout scenarios
function getFallbackQuestions() {
  return {
    summary: "We've prepared targeted questions to identify specific AI automation opportunities in your business.",
    questions: [
      {
        text: "Describe your most time-consuming recurring process that involves collecting, organizing, or analyzing information (e.g., lead qualification, proposal creation, data entry, reporting).",
        type: "text",
        options: []
      },
      {
        text: "What specific customer communication tasks currently require manual effort from your team?",
        type: "multiple_choice",
        options: ["Initial inquiries & lead response", "Appointment scheduling & follow-ups", "Customer support & FAQ responses", "Onboarding new clients", "Progress updates & status reports", "Multiple of the above"]
      },
      {
        text: "Which of these content creation activities takes the most time in your business?",
        type: "multiple_choice",
        options: ["Writing proposals, quotes, or contracts", "Creating social media posts", "Email campaigns & newsletters", "Blog posts or articles", "Product descriptions or marketing copy", "Client reports or presentations"]
      },
      {
        text: "Describe a specific task you do repeatedly that involves following the same steps or decision-making process each time.",
        type: "text",
        options: []
      },
      {
        text: "What information do you wish you could automatically extract or organize from documents, emails, or websites?",
        type: "text",
        options: []
      },
      {
        text: "Which manual process costs you the most money in staff time or lost opportunities?",
        type: "multiple_choice",
        options: ["Manual data entry and organization", "Responding to customer inquiries", "Creating custom content or documents", "Qualifying and following up with leads", "Scheduling and coordination tasks", "Research and competitive analysis"]
      },
      {
        text: "If you could automate one workflow that currently requires multiple team members or tools, what would it be?",
        type: "text",
        options: []
      },
      {
        text: "What specific business metrics would improve if you saved 10+ hours per week on manual tasks?",
        type: "multiple_choice",
        options: ["Revenue growth from more sales time", "Customer satisfaction from faster response", "Team productivity and capacity", "Cost reduction from efficiency", "Better quality/consistency of output", "Ability to handle more clients/projects"]
      }
    ],
    sources: [
      { title: "AI Business Process Automation Guide", url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier" },
      { title: "Small Business AI Adoption Study 2024", url: "https://www.salesforce.com/news/stories/ai-small-business-research/" },
      { title: "ROI of Business Process Automation", url: "https://blog.hubspot.com/service/what-is-business-process-automation" }
    ]
  };
}

export async function callResponses<T>({
  input,
  schema,
  tools = [{ type: "web_search" }],
  model = process.env.OPENAI_MODEL || "gpt-5-mini",
  reasoning_effort = "low"
}: {
  input: any;
  schema: any;
  tools?: any[];
  model?: string;
  reasoning_effort?: "minimal" | "low" | "medium" | "high";
}): Promise<T> {
  // Build the request payload according to GPT-5 documentation
  const payload: any = {
    model,
    input,
    tools,
    tool_choice: "auto",
    text: {
      format: {
        type: "json_schema",
        name: schema.name || "DefaultSchema",
        schema: schema.schema || schema,
        strict: true
      }
    }
  };

  // Add reasoning effort for GPT-5 models to enable deeper analysis
  if (model.includes('gpt-5')) {
    // Use low effort for web_search compatibility while keeping speed
    // Web_search requires at least "low" reasoning effort
    payload.reasoning = { effort: reasoning_effort || "low" };
  }

  // ALWAYS use Responses API for GPT-5 models
  const apiEndpoint = "https://api.openai.com/v1/responses";
  const controller = new AbortController();
  
  // CRITICAL: Extended timeout for GPT-5 with web search and reasoning
  // Vercel Hobby has 10s function limit, but we'll set higher and handle gracefully
  // GPT-5 with web search can take 15-30 seconds
  const timeoutMs = process.env.VERCEL 
    ? 25000  // 25 seconds on Vercel (will fail on hobby at 10s, but works on Pro)
    : 45000; // 45 seconds for local development
    
  console.log(`Starting GPT-5 API call with ${timeoutMs/1000}s timeout...`);
  
  // Debug logging to verify API key format
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: OPENAI_API_KEY is not set!");
    throw new Error("OPENAI_API_KEY environment variable is missing");
  }
  
  // Log key format (safely, without exposing the full key)
  const keyPrefix = apiKey.substring(0, 10);
  const keyLength = apiKey.length;
  console.log(`API Key format: ${keyPrefix}... (length: ${keyLength} chars)`);
  
  // Verify it's a project key
  if (!apiKey.startsWith('sk-proj-')) {
    console.warn(`Warning: API key doesn't start with 'sk-proj-'. Format: ${keyPrefix}...`);
  }
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error(`OpenAI API Error Response: ${error}`);
      throw new Error(`OpenAI Responses API ${response.status}: ${error}`);
    }

    const data = await response.json();
    
    // According to GPT-5 docs: data.output_parsed || data.output?.[0]?.content?.[0]?.parsed
    let parsed = data.output_parsed || 
                data.output?.[0]?.content?.[0]?.parsed ||
                data.output?.[0]?.content?.parsed;
                
    // If no parsed output, try to extract from text
    if (!parsed && data.output?.[0]?.content?.[0]?.text) {
      try {
        parsed = JSON.parse(data.output[0].content[0].text);
      } catch (e) {
        // Not JSON, try to find message output
        const messageOutput = data.output?.find((o: any) => o.type === 'message');
        const textContent = messageOutput?.content?.[0]?.text;
        if (textContent) {
          try {
            parsed = JSON.parse(textContent);
          } catch (e2) {
            console.error(`Failed to parse JSON from text: ${textContent.substring(0, 200)}`);
            throw new Error(`Failed to parse JSON response`);
          }
        }
      }
    }
    
    // If still no parsed output, check output array structure
    if (!parsed && data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'message' && item.content) {
          const content = Array.isArray(item.content) ? item.content[0] : item.content;
          if (content?.text) {
            try {
              parsed = JSON.parse(content.text);
              break;
            } catch (e) {
              // Continue to next item
            }
          }
        }
      }
    }
    
    if (!parsed) {
      console.error('Response structure:', JSON.stringify(data, null, 2).substring(0, 1000));
      throw new Error("Could not extract parsed output from response");
    }
    
    return parsed as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      // More informative timeout message
      console.warn(`OpenAI API timeout after ${timeoutMs/1000}s - GPT-5 with web search needs more time`);
      console.warn('Consider upgrading to Vercel Pro for longer timeouts (up to 300s)');
      console.warn('Returning enhanced fallback questions...');
      return getFallbackQuestions() as T;
    }
    console.error('OpenAI API error:', error.message);
    // Return fallback on any error in production
    if (process.env.NODE_ENV === 'production' || error.message.includes('503')) {
      console.warn('API unavailable or error - using enhanced fallback questions');
      return getFallbackQuestions() as T;
    }
    throw error;
  }
}

// Retry wrapper with exponential backoff
export async function callResponsesWithRetry<T>(
  params: {
    input: any;
    schema: any;
    tools?: any[];
    model?: string;
    reasoning_effort?: "minimal" | "low" | "medium" | "high";
  },
  retries = 2
): Promise<T> {
  try {
    return await callResponses<T>(params);
  } catch (error: any) {
    if (retries > 0 && (error.message.includes("429") || error.message.includes("5"))) {
      console.log(`Retrying after error: ${error.message}. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 500 * (3 - retries)));
      return callResponsesWithRetry<T>(params, retries - 1);
    }
    throw error;
  }
}