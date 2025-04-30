'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, BookOpen } from 'lucide-react';

interface QuickReference {
  id: number;
  topic: string;
  content: string;
  created_at: string;
}

interface ReferenceClientProps {
  reference: QuickReference;
  id: string;
}

export default function ReferenceClient({ reference, id }: ReferenceClientProps) {
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      {/* Hero section with gradient background */}
      <div className="relative rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-8 shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <FileText className="w-full h-full text-indigo-600" />
        </div>
        
        {/* Back Navigation */}
        <Link
          href={`/roadmaps/${id}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roadmap
        </Link>
        
        {/* Header with better typography */}
        <h1 className="text-3xl font-bold mb-3 text-gray-800 leading-tight">
          {reference.topic} - Quick Reference Guide
        </h1>
        
        <div className="text-sm text-gray-600">
          A condensed guide to help you quickly recall key concepts and information
        </div>
      </div>
      
      {/* Content Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center bg-white">
          <BookOpen className="h-5 w-5 text-indigo-500 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Quick Reference</h2>
        </div>
        <div className="px-5 py-4 bg-white">
          <div className="prose prose-indigo max-w-none">
            {renderMarkdownContent(reference.content)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Markdown renderer that creates React elements with matching roadmap styling
function renderMarkdownContent(content: string) {
  // Track if we're in a list to group list items
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let renderedContent: React.ReactNode[] = [];
  
  // Split the content into lines
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for empty lines
    if (line.trim() === '') {
      // If we were in a list, close it
      if (inList) {
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4 text-gray-700">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      return; // Skip empty lines
    }
    
    // Check for headings
    if (line.startsWith('# ')) {
      // Close any open list
      if (inList) {
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4 text-gray-700">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      
      renderedContent.push(
        <h1 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-800">{line.substring(2)}</h1>
      );
      return;
    }
    
    if (line.startsWith('## ')) {
      // Close any open list
      if (inList) {
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4 text-gray-700">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      
      renderedContent.push(
        <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800 flex items-center">
          <span className="bg-indigo-100 rounded-md p-1 mr-2 inline-flex items-center justify-center">
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          {line.substring(3)}
        </h2>
      );
      return;
    }
    
    if (line.startsWith('### ')) {
      // Close any open list
      if (inList) {
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4 text-gray-700">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      
      renderedContent.push(
        <h3 key={index} className="text-lg font-medium mt-5 mb-2 text-gray-800">{line.substring(4)}</h3>
      );
      return;
    }
    
    // Check for list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listText = line.trim().startsWith('- ') 
        ? formatInlineElements(line.substring(line.indexOf('- ') + 2))
        : formatInlineElements(line.substring(line.indexOf('* ') + 2));
      
      inList = true;
      listItems.push(
        <li key={`item-${index}`} className="flex items-start gap-2 my-1">
          <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
            <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-gray-700">{listText}</span>
        </li>
      );
      return;
    }
    
    // Process paragraphs - handle inline formatting
    if (inList) {
      renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4 text-gray-700">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
    
    renderedContent.push(
      <p key={index} className="my-3 text-gray-700 leading-relaxed">
        {formatInlineElements(line)}
      </p>
    );
  });
  
  // Close any open list at the end
  if (inList && listItems.length > 0) {
    renderedContent.push(<ul key={`list-end`} className="list-disc pl-5 my-4 text-gray-700">{listItems}</ul>);
  }
  
  return <>{renderedContent}</>;
}

// Function to format inline elements like bold, italic, and links
function formatInlineElements(text: string) {
  // Separate out components for bold, italic, and links
  const parts: Array<{ type: string; content: string; url?: string }> = [];
  let currentIndex = 0;
  
  // Find bold text
  const boldRegex = /\*\*(.*?)\*\*/g;
  let boldMatch;
  while ((boldMatch = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (boldMatch.index > currentIndex) {
      parts.push({ type: 'text', content: text.slice(currentIndex, boldMatch.index) });
    }
    
    // Add the bold text
    parts.push({ type: 'bold', content: boldMatch[1] });
    
    currentIndex = boldMatch.index + boldMatch[0].length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(currentIndex) });
  }
  
  // Convert parts to React elements
  return (
    <>
      {parts.map((part, idx) => {
        switch (part.type) {
          case 'bold':
            return <strong key={idx} className="font-semibold">{part.content}</strong>;
          case 'italic':
            return <em key={idx}>{part.content}</em>;
          case 'link':
            return (
              <a
                key={idx}
                href={part.url}
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {part.content}
              </a>
            );
          default:
            return <span key={idx}>{part.content}</span>;
        }
      })}
    </>
  );
}