import React from 'react';

export function formatAnalysisText(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      elements.push(<br key={`br-${key++}`} />);
      continue;
    }

    // Remove markdown heading symbols and make them proper headings
    if (line.startsWith('###')) {
      const heading = line.replace(/^###\s*/, '').replace(/\*\*/g, '');
      elements.push(
        <h3 key={`h3-${key++}`} className="text-xl font-bold mt-6 mb-3 text-foreground">
          {heading}
        </h3>
      );
      continue;
    }

    if (line.startsWith('##')) {
      const heading = line.replace(/^##\s*/, '').replace(/\*\*/g, '');
      elements.push(
        <h2 key={`h2-${key++}`} className="text-2xl font-bold mt-6 mb-4 text-foreground">
          {heading}
        </h2>
      );
      continue;
    }

    // Handle list items
    if (line.match(/^\d+\.\s+/)) {
      const content = line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '');
      elements.push(
        <li key={`li-${key++}`} className="ml-6 mb-2 list-decimal text-foreground">
          {content}
        </li>
      );
      continue;
    }

    if (line.startsWith('-') || line.startsWith('•')) {
      const content = line.replace(/^[-•]\s+/, '').replace(/\*\*/g, '');
      elements.push(
        <li key={`li-${key++}`} className="ml-6 mb-2 list-disc text-foreground">
          {content}
        </li>
      );
      continue;
    }

    // Handle bold text (Step markers, etc.)
    if (line.includes('**')) {
      const parts = line.split('**');
      const formatted = parts.map((part, idx) => 
        idx % 2 === 1 ? <strong key={`bold-${key++}`}>{part}</strong> : part
      );
      elements.push(
        <p key={`p-${key++}`} className="mb-3 leading-relaxed text-foreground">
          {formatted}
        </p>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${key++}`} className="mb-3 leading-relaxed text-foreground">
        {line}
      </p>
    );
  }

  return elements;
}
