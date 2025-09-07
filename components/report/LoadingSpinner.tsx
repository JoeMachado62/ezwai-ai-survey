
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Parsing your report structure...",
  "Delegating tasks to our AI creative director...",
  "Generating artistic concepts for each section...",
  "Painting digital masterpieces (this can take a moment)...",
  "Assembling your visually enhanced report...",
  "Finalizing the high-resolution assets...",
];

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-brand-teal rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-brand-orange rounded-full animate-spin [animation-direction:reverse]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        </div>
      </div>
      <h2 className="font-serif text-3xl font-bold text-gray-800 mb-4">Generating Your Report</h2>
      <p className="text-lg text-gray-600 transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingSpinner;
