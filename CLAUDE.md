# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: GPT-5 IS AVAILABLE - DO NOT CHANGE TO GPT-4 ⚠️

**IMPORTANT**: GPT-5 models ARE available and working via the Responses API:
- `gpt-5-mini` - Fast, cost-optimized model for questions
- `gpt-5` - Full model for complex reasoning and reports
- These models use the `/v1/responses` endpoint (NOT chat/completions)
- DO NOT fallback to GPT-4 - GPT-5 is the correct model to use

## Project Overview

EZWAI AI Opportunities Survey - A Next.js application that generates business-specific AI questions and reports using OpenAI's GPT-5 Responses API with web search capabilities, integrated with GoHighLevel (GHL) CRM.

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, TailwindCSS
- **AI Model**: OpenAI GPT-5 via Responses API
- **API Integration**: 
  - OpenAI Responses API (`/v1/responses`) with web_search tool
  - GoHighLevel LeadConnector API for CRM
- **PDF Generation**: pdf-lib
- **Validation**: Zod schemas

### Key API Routes

1. **`/api/questions`** - Generates dynamic survey questions
   - Uses GPT-5-mini (fast, cost-optimized model) via Responses API
   - Enforces web search for current information
   - Returns structured JSON with questions and sources

2. **`/api/report`** - Creates AI Opportunities report
   - Uses GPT-5 (full model for complex reasoning) via Responses API
   - Generates executive summary, quick wins, recommendations
   - Includes competitive analysis with web-sourced benchmarks

3. **`/api/report/pdf`** - Generates downloadable PDF version of report

4. **`/api/ghl/contact`** - Creates/updates GoHighLevel contact
   - Saves complete survey and report as notes in CRM

### OpenAI Responses API Configuration

The app uses the GPT-5 Responses API (not Chat Completions) for:
- Built-in web search tool
- Structured JSON outputs via json_schema
- Guaranteed output format with `output_parsed`

Key differences from Chat Completions:
- Endpoint: `/v1/responses` (not `/v1/chat/completions`)
- Input field: `input` (not `messages`)
- Tools: Built-in `web_search` (not function calling)
- Output: `output_parsed` for structured data

### Project Structure

```
app/
├── embed/page.tsx          # Main embeddable survey UI
├── api/
│   ├── questions/          # Questions generation (GPT-4o-mini)
│   ├── report/            # Report generation (GPT-5)
│   └── ghl/contact/       # GoHighLevel integration
components/
├── Field.tsx              # Form field components
├── StepCard.tsx           # Step container component
├── LoadingDots.tsx        # Loading indicator
└── LoadingOverlay.tsx     # Full-screen loading overlay
lib/
├── openai.ts              # Responses API wrapper
├── schemas.ts             # JSON schemas for structured outputs
└── rateLimit.ts           # IP-based rate limiting
```

## Environment Variables

Required in `.env.local` for development or Vercel environment:

```
# GPT-5 Models
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini          # Fast, cost-optimized model for questions
OPENAI_MODEL_REPORT=gpt-5        # Full model for complex reasoning in reports

# GoHighLevel
GHL_TOKEN=lc_xxx_bearer_token
GHL_LOCATION_ID=your_location_id

# Security
ALLOWED_FRAME_ANCESTORS='self' https://ezwai.com
```

## Key Implementation Details

### Survey Flow
1. Business intake (company info, tech stack, social media)
2. Dynamic questions generation with web search
3. Report generation with GPT-5
4. Contact details collection
5. Save to GoHighLevel CRM

### Responses API Features
- **Web Search**: Automatically searches for current information
- **Sources Array**: Required in schema to surface citations
- **Structured Output**: Uses `json_schema` for guaranteed format
- **Retry Logic**: Exponential backoff for rate limits

### Development Notes

- The app uses OpenAI's Responses API endpoint (`/v1/responses`)
- Web search is enabled on all API calls for current information
- Sources are required in the schema (minimum 3 per response)
- Rate limiting is implemented per IP address
- All API keys are server-side only for security
- The app is designed for iframe embedding in WordPress sites