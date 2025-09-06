Ezwai Api Guide — Responses + Gpt‑5 + Web Search
EZWAI API Guide — Using the Responses API with GPT‑5 and Web Search

Using GPT-5
Learn best practices, features, and migration guidance for GPT-5.
GPT-5 is our most intelligent model yet, trained to be especially proficient in:

Code generation, bug fixing, and refactoring
Instruction following
Long context and tool calling
This guide covers key features of the GPT-5 model family and how to get the most out of GPT-5.

Explore coding examples
Click through a few demo applications generated entirely with a single GPT-5 prompt, without writing any code by hand.

Quickstart
Faster responses
Coding and agentic tasks
GPT-5 is great at reasoning through complex tasks. For complex tasks like coding and multi-step planning, use high reasoning effort.

Use these configurations when replacing tasks you might have used o3 to tackle. We expect GPT-5 to produce better results than o3 and o4-mini under most circumstances.
Slower, high reasoning tasks
from openai import OpenAI
client = OpenAI()

result = client.responses.create(
    model="gpt-5",
    input="Find the null pointer exception: ...your code here...",
    reasoning={ "effort": "high" },
)

print(result.output_text)
Meet the models
There are three models in the GPT-5 series. In general, gpt-5 is best for your most complex tasks that require broad world knowledge. The smaller mini and nano models trade off some general world knowledge for lower cost and lower latency. Small models will tend to perform better for more well defined tasks.

To help you pick the model that best fits your use case, consider these tradeoffs:

Variant	Best for
gpt-5
Complex reasoning, broad world knowledge, and code-heavy or multi-step agentic tasks
gpt-5-mini
Cost-optimized reasoning and chat; balances speed, cost, and capability
gpt-5-nano
High-throughput tasks, especially simple instruction-following or classification
Model name reference
The GPT-5 system card uses different names than the API. Use this table to map between them:

System card name	API alias
gpt-5-thinking	gpt-5
gpt-5-thinking-mini	gpt-5-mini
gpt-5-thinking-nano	gpt-5-nano
gpt-5-main	gpt-5-chat-latest
gpt-5-main-mini	[not available via API]
New API features in GPT-5
Alongside GPT-5, we're introducing a few new parameters and API features designed to give developers more control and flexibility: the ability to control verbosity, a minimal reasoning effort option, custom tools, and an allowed tools list.

This guide walks through some of the key features of the GPT-5 model family and how to get the most out of these models.

Minimal reasoning effort
The reasoning.effort parameter controls how many reasoning tokens the model generates before producing a response. Earlier reasoning models like o3 supported only low, medium, and high: low favored speed and fewer tokens, while high favored more thorough reasoning.

The new minimal setting produces very few reasoning tokens for cases where you need the fastest possible time-to-first-token. We often see better performance when the model can produce a few tokens when needed versus none. The default is medium.

The minimal setting performs especially well in coding and instruction following scenarios, adhering closely to given directions. However, it may require prompting to act more proactively. To improve the model's reasoning quality, even at minimal effort, encourage it to “think” or outline its steps before answering.

Minimal reasoning effort
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="How much gold would it take to coat the Statue of Liberty in a 1mm layer?",
    reasoning={
        "effort": "minimal"
    }
)

print(response)
Verbosity
Verbosity determines how many output tokens are generated. Lowering the number of tokens reduces overall latency. While the model's reasoning approach stays mostly the same, the model finds ways to answer more concisely—which can either improve or diminish answer quality, depending on your use case. Here are some scenarios for both ends of the verbosity spectrum:

High verbosity: Use when you need the model to provide thorough explanations of documents or perform extensive code refactoring.
Low verbosity: Best for situations where you want concise answers or simple code generation, such as SQL queries.
Models before GPT-5 have used medium verbosity by default. With GPT-5, we make this option configurable as one of high, medium, or low.

When generating code, medium and high verbosity levels yield longer, more structured code with inline explanations, while low verbosity produces shorter, more concise code with minimal commentary.

Control verbosity
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="What is the answer to the ultimate question of life, the universe, and everything?",
    text={
        "verbosity": "low"
    }
)

print(response)
You can still steer verbosity through prompting after setting it to low in the API. The verbosity parameter defines a general token range at the system prompt level, but the actual output is flexible to both developer and user prompts within that range.

Custom tools
With GPT-5, we're introducing a new capability called custom tools, which lets models send any raw text as tool call input but still constrain outputs if desired.

Function calling guide
Learn about custom tools in the function calling guide.

Freeform inputs
Define your tool with type: custom to enable models to send plaintext inputs directly to your tools, rather than being limited to structured JSON. The model can send any raw text—code, SQL queries, shell commands, configuration files, or long-form prose—directly to your tool.

{
    "type": "custom",
    "name": "code_exec",
    "description": "Executes arbitrary python code",
}
Constraining outputs
GPT-5 supports context-free grammars (CFGs) for custom tools, letting you provide a Lark grammar to constrain outputs to a specific syntax or DSL. Attaching a CFG (e.g., a SQL or DSL grammar) ensures the assistant's text matches your grammar.

This enables precise, constrained tool calls or structured responses and lets you enforce strict syntactic or domain-specific formats directly in GPT-5's function calling, improving control and reliability for complex or constrained domains.

Best practices for custom tools
Write concise, explicit tool descriptions. The model chooses what to send based on your description; state clearly if you want it to always call the tool.
Validate outputs on the server side. Freeform strings are powerful but require safeguards against injection or unsafe commands.
Allowed tools
The allowed_tools parameter under tool_choice lets you pass N tool definitions but restrict the model to only M (< N) of them. List your full toolkit in tools, and then use an allowed_tools block to name the subset and specify a mode—either auto (the model may pick any of those) or required (the model must invoke one).

Function calling guide
Learn about the allowed tools option in the function calling guide.

By separating all possible tools from the subset that can be used now, you gain greater safety, predictability, and improved prompt caching. You also avoid brittle prompt engineering, such as hard-coded call order. GPT-5 dynamically invokes or requires specific functions mid-conversation while reducing the risk of unintended tool usage over long contexts.

Standard Tools	Allowed Tools
Model's universe	All tools listed under "tools": […]	Only the subset under "tools": […] in tool_choice
Tool invocation	Model may or may not call any tool	Model restricted to (or required to call) chosen tools
Purpose	Declare available capabilities	Constrain which capabilities are actually used
"tool_choice": {
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [
      { "type": "function", "name": "get_weather" },
      { "type": "mcp", "server_label": "deepwiki" },
      { "type": "image_generation" }
    ]
  }
}'
For a more detailed overview of all of these new features, see the accompanying cookbook.

Preambles
Preambles are brief, user-visible explanations that GPT-5 generates before invoking any tool or function, outlining its intent or plan (e.g., “why I'm calling this tool”). They appear after the chain-of-thought and before the actual tool call, providing transparency into the model's reasoning and enhancing debuggability, user confidence, and fine-grained steerability.

By letting GPT-5 “think out loud” before each tool call, preambles boost tool-calling accuracy (and overall task success) without bloating reasoning overhead. To enable preambles, add a system or developer instruction—for example: “Before you call a tool, explain why you are calling it.” GPT-5 prepends a concise rationale to each specified tool call. The model may also output multiple messages between tool calls, which can enhance the interaction experience—particularly for minimal reasoning or latency-sensitive use cases.

For more on using preambles, see the GPT-5 prompting cookbook.

Migration guidance
GPT-5 is our best model yet, and it works best with the Responses API, which supports for passing chain of thought (CoT) between turns. Read below to migrate from your current model or API.

Migrating from other models to GPT-5
We see improved intelligence because the Responses API can pass the previous turn's CoT to the model. This leads to fewer generated reasoning tokens, higher cache hit rates, and less latency. To learn more, see an in-depth guide on the benefits of responses.

When migrating to GPT-5 from an older OpenAI model, start by experimenting with reasoning levels and prompting strategies. Based on our testing, we recommend using our prompt optimizer—which automatically updates your prompts for GPT-5 based on our best practices—and following this model-specific guidance:

o3: gpt-5 with medium or high reasoning is a great replacement. Start with medium reasoning with prompt tuning, then increasing to high if you aren't getting the results you want.
gpt-4.1: gpt-5 with minimal or low reasoning is a strong alternative. Start with minimal and tune your prompts; increase to low if you need better performance.
o4-mini or gpt-4.1-mini: gpt-5-mini with prompt tuning is a great replacement.
gpt-4.1-nano: gpt-5-nano with prompt tuning is a great replacement.
Migrating from Chat Completions to Responses API
The biggest difference, and main reason to migrate from Chat Completions to the Responses API for GPT-5, is support for passing chain of thought (CoT) between turns. See a full comparison of the APIs.

Passing CoT exists only in the Responses API, and we've seen improved intelligence, fewer generated reasoning tokens, higher cache hit rates, and lower latency as a result of doing so. Most other parameters remain at parity, though the formatting is different. Here's how new parameters are handled differently between Chat Completions and the Responses API:

Reasoning effort

Responses API
Chat Completions
Generate response with minimal reasoning
curl --request POST \
--url https://api.openai.com/v1/responses \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--header 'Content-type: application/json' \
--data '{
  "model": "gpt-5",
  "input": "How much gold would it take to coat the Statue of Liberty in a 1mm layer?",
  "reasoning": {
    "effort": "minimal"
  }
}'
Verbosity

Responses API
Chat Completions
Control verbosity
curl --request POST \
--url https://api.openai.com/v1/responses \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--header 'Content-type: application/json' \
--data '{
  "model": "gpt-5",
  "input": "What is the answer to the ultimate question of life, the universe, and everything?",
  "text": {
    "verbosity": "low"
  }
}'
Custom tools

Responses API
Chat Completions
Custom tool call
curl --request POST --url https://api.openai.com/v1/responses --header "Authorization: Bearer $OPENAI_API_KEY" --header 'Content-type: application/json' --data '{
  "model": "gpt-5",
  "input": "Use the code_exec tool to calculate the area of a circle with radius equal to the number of r letters in blueberry",
  "tools": [
    {
      "type": "custom",
      "name": "code_exec",
      "description": "Executes arbitrary python code"
    }
  ]
}'
Prompting guidance
We specifically designed GPT-5 to excel at coding, frontend engineering, and tool-calling for agentic tasks. We also recommend iterating on prompts for GPT-5 using the prompt optimizer.

GPT-5 prompt optimizer
Craft the perfect prompt for GPT-5 in the dashboard

GPT-5 prompting guide
Learn full best practices for prompting GPT-5 models

Frontend prompting for GPT-5
See prompt samples specific to frontend development

GPT-5 is a reasoning model
Reasoning models like GPT-5 break problems down step by step, producing an internal chain of thought that encodes their reasoning. To maximize performance, pass these reasoning items back to the model: this avoids re-reasoning and keeps interactions closer to the model's training distribution. In multi-turn conversations, passing a previous_response_id automatically makes earlier reasoning items available. This is especially important when using tools—for example, when a function call requires an extra round trip. In these cases, either include them with previous_response_id or add them directly to input.

Learn more about reasoning models and how to get the most out of them in our reasoning guide.

Audience: your AI agent and any devs wiring requests from the Next.js/Vercel backend.
Goal: stop using legacy Chat Completions; use the Responses API with built‑in tools (especially web_search) and JSON Schema outputs.

0) TL;DR — Minimal, production‑ready call (Node / TypeScript)
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });


// JSON Schema contract for a questions step (example)
const QuestionsJsonSchema = {
  name: "QuestionsSchema",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "questions", "sources"],
    properties: {
      summary: { type: "string" },
      questions: {
        type: "array",
        minItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "text"],
          properties: {
            type: { type: "string", enum: ["multiple_choice", "text"] },
            text: { type: "string" },
            options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } }
          }
        }
      },
      sources: {
        type: "array",
        minItems: 3,
        items: { type: "object", required: ["title", "url"], properties: { title: { type: "string" }, url: { type: "string" } } }
      }
    }
  }
} as const;


const SYSTEM = `You are an AI Transformation Consultant. ALWAYS perform web_search before finalizing answers. Return structured JSON matching the schema exactly. Put all links in the sources array.`;


export async function generateQuestions(input: any) {
  const res = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini", // fast stage
    input: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Business Facts:\n${JSON.stringify(input, null, 2)}` }
    ],
    tools: [{ type: "web_search" }],
    tool_choice: "auto",
    response_format: { type: "json_schema", json_schema: QuestionsJsonSchema }
  });


  // Prefer the parsed payload when using json_schema
  return res.output_parsed as {
    summary: string;
    questions: { type: "multiple_choice" | "text"; text: string; options?: string[] }[];
    sources: { title: string; url: string }[];
  };
}
1) Endpoint & Request Basics

Endpoint: POST https://api.openai.com/v1/responses

Auth: Authorization: Bearer ${OPENAI_API_KEY}

Content‑Type: application/json

Core fields:

model: e.g. gpt-5 for deep analysis, gpt-4o-mini for fast/lightweight stages.

input: messages or a single string (supports roles like system/user).

tools: enable built‑in tools such as [{ type: "web_search" }].

tool_choice: usually "auto" (let the model decide when to call tools).

response_format: strongly recommended — { type: "json_schema", json_schema: ... } to enforce structured outputs.

Why Responses API (not Chat Completions)?

Unified: One API to orchestrate tools, multi‑turn context, and structured outputs.

Safer contracts: json_schema returns output_parsed (typed JSON) instead of brittle string parsing.

Built‑in tools: web search, file search, code interpreter, etc.

2) Model Selection — incl. GPT‑5

Primary deep‑reasoning model: gpt-5

Faster/cheaper stage model: gpt-4o-mini

Env toggle example:

OPENAI_MODEL=gpt-4o-mini (questions, triage)

OPENAI_MODEL_REPORT=gpt-5 (final report)

If a dated snapshot is required later, set the env var to that id. Otherwise prefer the canonical ID (e.g., gpt-5).

3) Forcing topicality — Web Search Every Time

Enable the tool and bake it into the contract:

Add tools: [{ type: "web_search" }] and tool_choice: "auto" in every call.

In the system prompt, explicitly require one or more searches and synthesis.

In the JSON schema, require a sources[] array (title + url) so the agent must surface citations.

Reusable prompt block:

SYSTEM:
You are an AI Transformation Consultant.
ALWAYS ground outputs with one or more web_search calls before finalizing.
Use diverse, reputable sources. Prefer items from the last 180 days; if evergreen, still verify one recent source.
Return JSON that matches the provided schema exactly. Place all links in the sources array.
Do not reveal chain-of-thought.
4) JSON Schema Contracts (recommended patterns)
Questions stage

Require 5–10 questions, at least 2 multiple‑choice, and a sources[] list.

Example schema used in the TL;DR (above).

Report stage
const ReportJsonSchema = {
  name: "ReportSchema",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["executiveSummary", "quickWins", "recommendations", "competitiveAnalysis", "nextSteps", "sources"],
    properties: {
      executiveSummary: { type: "string" },
      quickWins: { type: "array", minItems: 2, items: { type: "object", required: ["title","description","timeframe","impact"], properties: { title: {type:"string"}, description:{type:"string"}, timeframe:{type:"string"}, impact:{type:"string"} } } },
      recommendations: { type: "array", minItems: 2, items: { type: "object", required: ["title","description","roi"], properties: { title: {type:"string"}, description:{type:"string"}, roi:{type:"string"} } } },
      competitiveAnalysis: { type: "string" },
      nextSteps: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
      sources: { type: "array", minItems: 3, items: { type: "object", required: ["title","url"], properties: { title: {type:"string"}, url: {type:"string"} } } }
    }
  }
} as const;
5) Example — Final report with GPT‑5 (Node SDK)
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });


export async function buildReport(context: any) {
  const SYSTEM = `You are an AI Transformation Consultant. ALWAYS perform web_search before finalizing answers. Return JSON per schema. Include 3–8 sources.`;


  const res = await client.responses.create({
    model: process.env.OPENAI_MODEL_REPORT || "gpt-5",
    input: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Create an AI Opportunities Report from this context:\n${JSON.stringify(context, null, 2)}` }
    ],
    tools: [{ type: "web_search" }],
    tool_choice: "auto",
    response_format: { type: "json_schema", json_schema: ReportJsonSchema }
  });


  // Strongly prefer structured output
  const parsed = res.output_parsed as {
    executiveSummary: string;
    quickWins: { title: string; description: string; timeframe: string; impact: string }[];
    recommendations: { title: string; description: string; roi: string }[];
    competitiveAnalysis: string;
    nextSteps: string[];
    sources: { title: string; url: string }[];
  };
  return parsed;
}
6) cURL & Fetch equivalents
cURL
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": [
      {"role":"system","content":"ALWAYS search. Return JSON per schema."},
      {"role":"user","content":"Make a short AI opportunities report for a 10-person landscaping company."}
    ],
    "tools": [{"type":"web_search"}],
    "tool_choice": "auto",
    "response_format": {"type":"json_schema","json_schema": {"name":"Demo","schema":{"type":"object","properties":{"summary":{"type":"string"},"sources":{"type":"array","items":{"type":"object","properties":{"title":{"type":"string"},"url":{"type":"string"}}}}},"required":["summary","sources"],"additionalProperties":false}}}
  }'
Native fetch (Node 18+ / Edge)
const r = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-5",
    input: "Summarize the latest AI trends relevant to SMB retail.",
    tools: [{ type: "web_search" }],
    tool_choice: "auto",
    response_format: { type: "json_schema", json_schema: { name: "X", schema: { type: "object", required:["summary"], properties: { summary: { type: "string" } } } }
  })
});
const data = await r.json();
const parsed = data.output_parsed ?? data.output?.[0]?.content?.[0]?.parsed ?? null;
7) Migration cheatsheet — Chat Completions ➜ Responses
Concept	Old (chat.completions)	New (responses)
Endpoint	/v1/chat/completions	/v1/responses
Messages	messages: [{role, content}]	input: [{role, content}] (or a single string)
Tools	tools, tool_choice (function calling)	tools with built‑in tools (e.g., web_search); tool_choice: "auto"
JSON output	No guarantees; string parsing	response_format: { type: "json_schema" } ➜ output_parsed
Streaming	stream: true SSE	SSE; SDK helper client.responses.stream(...)

Key edits for migration:

Replace messages with input.

Add tools: [{ type: "web_search" }].

Swap fragile string prompts for json_schema contracts and read from output_parsed.

Update model ids (e.g., gpt-5, gpt-4o-mini).

8) Enforcing quality: patterns your agent should follow

Recency discipline: explicitly ask for results from the last 180 days where applicable; otherwise include at least one recent source.

Diversity: include sources from multiple reputable domains; de‑duplicate near‑identical articles.

Uncertainty: when sources conflict, note the ambiguity in the output and include both sources.

Security: never echo secrets; do not place keys in prompts or URLs.

9) Error handling & retries (pseudo)
async function call<T>(payload: any, retries = 2): Promise<T> {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (r.status === 429 || r.status >= 500) {
    if (retries > 0) { await new Promise(s => setTimeout(s, 500 * (3 - retries))); return call<T>(payload, retries - 1); }
  }
  if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`);
  const data = await r.json();
  return (data.output_parsed ?? data.output?.[0]?.content?.[0]?.parsed) as T;
}
10) Streaming (optional)

In SDKs: use client.responses.stream(...) and iterate events to render tokens/citations live.

In raw fetch: set stream: true and consume the SSE data; aggregate into JSON at response.completed.

Keep streaming off for schema‑constrained phases unless you specifically handle partial JSON.

11) Security notes for agents

Never call the API from the browser with a raw key.

Use server routes (Next.js API routes) and keep keys in environment variables.

If you must expose anything client‑side, use a short‑lived token proxy with strict allow‑lists.

12) Canonical request templates
Questions stage (fast model)
const payload = {
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  input: [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Business Facts:\n${JSON.stringify(input, null, 2)}` }
  ],
  tools: [{ type: "web_search" }],
  tool_choice: "auto",
  response_format: { type: "json_schema", json_schema: QuestionsJsonSchema }
};
Report stage (deep model)
const payload = {
  model: process.env.OPENAI_MODEL_REPORT || "gpt-5",
  input: [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Create an AI Opportunities Report from this context:\n${JSON.stringify(context, null, 2)}` }
  ],
  tools: [{ type: "web_search" }],
  tool_choice: "auto",
  response_format: { type: "json_schema", json_schema: ReportJsonSchema }
};
13) FAQ for the agent

Q: Can I keep using chat.completions?
A: No; migrate to /v1/responses for built‑in tools + schema outputs.

Q: How do I force web search?
A: Include the tool, require sources[] in the schema, and state the rule in the system prompt.

Q: Where do I get structured data?
A: Read output_parsed. Use output_text only for human‑readable summaries.

Q: What model id should I use for the final report?
A: gpt-5 (toggle via OPENAI_MODEL_REPORT).

End of guide.