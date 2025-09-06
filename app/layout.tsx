import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EZWAI — AI Opportunities Survey",
  description: "Generate AI questions & report, save to GoHighLevel",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}