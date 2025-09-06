// GPT-5 Responses API implementation
export async function callResponses<T>({
  input,
  schema,
  tools = [{ type: "web_search" }],
  model = process.env.OPENAI_MODEL || "gpt-4o-mini"
}: {
  input: any;
  schema: any;
  tools?: any[];
  model?: string;
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

  // Add think_effort for GPT-5 models to enable deeper research
  if (model.includes('gpt-5')) {
    payload.think_effort = "high";  // Enable deep research and web search
  } else {
    // Only add temperature for non-GPT-5 models
    payload.temperature = 0.4;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

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
}

// Retry wrapper with exponential backoff
export async function callResponsesWithRetry<T>(
  params: {
    input: any;
    schema: any;
    tools?: any[];
    model?: string;
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