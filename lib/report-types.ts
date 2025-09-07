export interface ReportSection {
  title: string;
  // The main body of text for the section
  mainContent: string;
  imagePrompt: string;
  // Optional, impactful quote extracted from the main content
  pullQuote?: string; 
  // Optional, list of key points for a sidebar
  keyTakeaways?: string[];
  // Optional, a key statistic to highlight
  statistic?: {
    value: string; // e.g., "75%" or "$1.2M"
    description: string;
  };
  // This will hold the base64 data URL for the generated image
  imageUrl?: string; 
}