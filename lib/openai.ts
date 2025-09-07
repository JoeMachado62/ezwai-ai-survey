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
    summary: "We've prepared some initial questions to understand your AI opportunities better.",
    questions: [
      {
        text: "What percentage of your daily tasks could potentially be automated?",
        type: "multiple_choice",
        options: ["Less than 25%", "25-50%", "50-75%", "More than 75%"]
      },
      {
        text: "Which area would benefit most from AI automation in your business?",
        type: "multiple_choice",
        options: ["Customer service", "Marketing & Sales", "Operations", "Finance & Accounting", "HR & Recruiting"]
      },
      {
        text: "How much time do you spend on repetitive administrative tasks weekly?",
        type: "multiple_choice",
        options: ["Less than 5 hours", "5-10 hours", "10-20 hours", "More than 20 hours"]
      },
      {
        text: "What's your biggest concern about implementing AI?",
        type: "text"
      },
      {
        text: "Do you currently use any form of automation or AI tools?",
        type: "multiple_choice",
        options: ["Yes, extensively", "Yes, some basic tools", "No, but interested", "No, not interested"]
      },
      {
        text: "What's your annual budget for new technology solutions?",
        type: "multiple_choice",
        options: ["Under $5,000", "$5,000-$25,000", "$25,000-$100,000", "Over $100,000"]
      },
      {
        text: "How would you rate your team's technical expertise?",
        type: "multiple_choice",
        options: ["Very technical", "Somewhat technical", "Not very technical", "Non-technical"]
      },
      {
        text: "What specific business outcome would you most like AI to help achieve?",
        type: "text"
      }
    ],
    sources: [
      { title: "AI Business Transformation Guide", url: "https://example.com/ai-guide" },
      { title: "Industry AI Adoption Statistics", url: "https://example.com/stats" },
      { title: "SMB Automation Opportunities", url: "https://example.com/smb-automation" }
    ]
  };
}
export async function callResponses<T>({
  input,
  schema,
  tools = [{ type: "web_search" }],
  model = process.env.OPENAI_MODEL || "gpt-5-mini",
  reasoning_effort = "minimal"
}: {
  input: any;
  schema: any;
  tools?: any[];
  model?: string;
  reasoning_effort?: "minimal" | "medium" | "high";
}): Promise<T> {
  // Build the request payload
  const payload: any = {
    model,
    input,
    tools,
    tool_choice: "auto",
    text: {
      format: {
        name: schema.name,
        type: "json_schema",
        schema: schema.schema
      }
    }
  };

  // Add reasoning effort for GPT-5 models to enable deeper analysis
  if (model.includes('gpt-5')) {
    // Use minimal effort for fastest responses in questions
    // Can be overridden per call if needed
    payload.reasoning = { effort: reasoning_effort || "minimal" };  
    // Use low verbosity for faster, more concise responses
    payload.text = {
      ...payload.text,
      verbosity: "low"  // Concise responses for faster processing
    };
  }

  // ALWAYS use Responses API for GPT-5 models
  const apiEndpoint = "https://api.openai.com/v1/responses";
  const controller = new AbortController();
  // Set timeout to 18 seconds for dev, can be longer in production
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18 second timeout
  
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Responses API ${response.status}: ${error}`);
    }

    const data = await response.json();
    
    // Try multiple response structures based on test results
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
            throw new Error(`Failed to parse JSON response: ${textContent}`);
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
      console.error('Response structure:', JSON.stringify(data, null, 2).substring(0, 500));
      throw new Error("Could not extract parsed output from response");
    }
    
    return parsed as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      // Return fallback response on timeout
      console.warn('OpenAI API timeout - returning fallback questions');
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
    reasoning_effort?: "minimal" | "medium" | "high";
  },
  retries = 2
): Promise<T> {
  try {
    return await callResponses<T>(params);
  } catch (error: any) {
    if (retries > 0 && (error.message.includes("429") || error.message.includes("5"))) {
      await new Promise(resolve => setTimeout(resolve, 500 * (3 - retries)));
      return callResponsesWithRetry<T>(params, retries - 1);
    }
    throw error;
  }
}