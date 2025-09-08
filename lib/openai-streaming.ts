/**
 * Alternative approach for handling long-running GPT-5 API calls
 * Optimized for Railway deployment with extended timeouts
 */

// Store for in-progress requests
const requestStore = new Map<string, any>();

/**
 * Initiates an async GPT-5 request and returns immediately with a request ID
 */
export async function startAsyncRequest(payload: any): Promise<{ requestId: string }> {
  const requestId = Math.random().toString(36).substring(7);
  
  // Start the request in the background
  processRequest(requestId, payload);
  
  return { requestId };
}

/**
 * Process the request asynchronously
 */
async function processRequest(requestId: string, payload: any) {
  requestStore.set(requestId, { 
    status: 'processing', 
    startTime: Date.now(),
    payload 
  });
  
  try {
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
      requestStore.set(requestId, { 
        status: 'error', 
        error,
        completedAt: Date.now()
      });
      return;
    }
    
    const data = await response.json();
    const parsed = data.output_parsed || 
                  data.output?.[0]?.content?.[0]?.parsed ||
                  data.output?.[0]?.content?.parsed;
                  
    requestStore.set(requestId, { 
      status: 'completed', 
      result: parsed,
      completedAt: Date.now()
    });
    
    // Clean up after 5 minutes
    setTimeout(() => requestStore.delete(requestId), 300000);
    
  } catch (error: any) {
    requestStore.set(requestId, { 
      status: 'error', 
      error: error.message,
      completedAt: Date.now()
    });
  }
}

/**
 * Poll for request completion
 */
export async function pollRequest(requestId: string): Promise<any> {
  const request = requestStore.get(requestId);
  
  if (!request) {
    throw new Error('Request not found');
  }
  
  if (request.status === 'completed') {
    return { status: 'completed', result: request.result };
  }
  
  if (request.status === 'error') {
    return { status: 'error', error: request.error };
  }
  
  // Still processing - check if timeout
  const elapsed = Date.now() - request.startTime;
  if (elapsed > 60000) { // 60 second maximum
    return { status: 'timeout' };
  }
  
  return { status: 'processing', elapsed };
}

/**
 * Client-side function to handle long-running requests with polling
 */
export async function callResponsesWithPolling<T>(
  endpoint: string,
  payload: any,
  onProgress?: (message: string) => void
): Promise<T> {
  try {
    // Start the async request
    const { requestId } = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, async: true })
    }).then(r => r.json());
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds with 1s intervals
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = await fetch(`${endpoint}?requestId=${requestId}`)
        .then(r => r.json());
      
      if (status.status === 'completed') {
        return status.result as T;
      }
      
      if (status.status === 'error') {
        throw new Error(status.error);
      }
      
      if (status.status === 'timeout') {
        throw new Error('Request timed out');
      }
      
      // Update progress
      if (onProgress) {
        const elapsed = Math.floor(status.elapsed / 1000);
        onProgress(`Processing... ${elapsed}s elapsed. GPT-5 is thinking deeply about your business...`);
      }
      
      attempts++;
    }
    
    throw new Error('Request timed out after 30 seconds');
    
  } catch (error) {
    console.error('Polling request failed:', error);
    throw error;
  }
}