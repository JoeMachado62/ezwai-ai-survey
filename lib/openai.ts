/**
 * GPT-5 Responses API implementation
 * 
 * CRITICAL: GPT-5 IS AVAILABLE AND WORKING!
 * - Use gpt-5-mini for fast responses (questions)
 * - Use gpt-5 for complex reasoning (reports)
 * - Always use /v1/responses endpoint for GPT-5
 * - DO NOT change to GPT-4 - GPT-5 is the correct model
 */
export async function callResponses<T>({
  input,
  schema,
  tools = [{ type: "web_search" }],
  model = process.env.OPENAI_MODEL || "gpt-5-mini",
  reasoning_effort = "medium"
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
    // Use medium effort by default for better speed/quality balance
    // High effort can take 60+ seconds
    payload.reasoning = { effort: reasoning_effort || "medium" };  
    // Can also add text.verbosity if needed
    payload.text = {
      ...payload.text,
      verbosity: "medium"  // Balance between detail and conciseness
    };
  }

  // ALWAYS use Responses API for GPT-5 models
  const apiEndpoint = "https://api.openai.com/v1/responses";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
  
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
    
    // Extract the text from the message output
    // Structure: output[1] is the message, content[0].text contains the response
    const messageOutput = data.output?.find((o: any) => o.type === 'message');
    const textContent = messageOutput?.content?.[0]?.text;
    
    if (!textContent) {
      throw new Error("No text output in response");
    }

    // Parse the JSON text
    try {
      const parsed = JSON.parse(textContent);
      return parsed as T;
    } catch (e) {
      throw new Error(`Failed to parse JSON response: ${textContent}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timed out after 2 minutes');
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