import { NextResponse } from 'next/server';

export async function GET() {
  // Health check endpoint for Railway
  return NextResponse.json({
    status: 'healthy',
    service: 'ezwai-ai-survey',
    timestamp: new Date().toISOString(),
    environment: process.env.RAILWAY_ENVIRONMENT || 'development'
  }, {
    status: 200
  });
}