import { NextResponse } from "next/server";

/**
 * Simple endpoint to provide API keys to the frontend
 * This is the ONLY thing the backend needs to do
 * All actual API calls happen directly from the browser
 */
export async function GET(req: Request) {
  // Check origin for security (only allow your domains)
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = [
    "http://localhost:3000",
    "https://ezwai.com",
    "https://www.ezwai.com",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""
  ].filter(Boolean);

  // Basic CORS check
  if (process.env.NODE_ENV === "production" && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
  }

  // Return API keys
  // In production, you might want to encrypt these or use short-lived tokens
  const config = {
    openaiKey: process.env.OPENAI_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY,
    // Don't send GHL token to frontend - keep that backend only
  };

  // Add CORS headers
  const response = NextResponse.json(config);
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set("Access-Control-Allow-Methods", "GET");
  
  return response;
}