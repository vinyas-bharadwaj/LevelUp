'use client';

import { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthContext from '@/app/context/AuthContext';

interface QuickReference {
  id: number;
  topic: string;
  content: string;
  created_at: string;
}

export default function QuickReferencePage() {
  const { id } = useParams();
  const router = useRouter();
  const [reference, setReference] = useState<QuickReference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext) || {}; // Get user from AuthContext
  
  useEffect(() => {
    const fetchReference = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is authenticated using AuthContext
        if (!user) {
          setError("You need to be logged in to view this reference");
          setIsLoading(false);
          router.push('/login');
          return;
        }
        
        // Get auth token from localStorage
        const authTokensStr = localStorage.getItem('authTokens');
        if (!authTokensStr) {
          setError("Authentication token not found");
          setIsLoading(false);
          router.push('/login');
          return;
        }
        
        const authTokens = JSON.parse(authTokensStr);
        const token = authTokens.access_token;
        
        const response = await fetch(`http://127.0.0.1:8000/studyplan/${id}/reference`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to load reference guide for roadmap ${id}`);
        }
        
        const data = await response.json();
        setReference(data);
      } catch (err) {
        console.error('Error fetching quick reference:', err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchReference();
    }
  }, [id, user, router]);
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="h-[600px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Not logged in warning
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
              <p className="mt-2 text-sm text-yellow-700">You need to be logged in to view this reference guide.</p>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !reference) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error || "Could not load the reference guide. Please try again."}</p>
              <div className="mt-4">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.push(`/roadmaps/${id}`)}
          className="mr-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Roadmap
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{reference.topic} - Quick Reference Guide</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Quick Reference</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="markdown-content prose prose-sm lg:prose-base xl:prose-lg max-w-none">
            {renderMarkdownContent(reference.content)}
          </div>
        </div>
      </div>
      
    </div>
  );
}

// Completely rewritten markdown renderer that properly handles React elements
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
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      return; // Skip empty lines
    }
    
    // Check for headings
    if (line.startsWith('# ')) {
      // Close any open list
      if (inList) {
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      
      renderedContent.push(
        <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.substring(2)}</h1>
      );
      return;
    }
    
    if (line.startsWith('## ')) {
      // Close any open list
      if (inList) {
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      
      renderedContent.push(
        <h2 key={index} className="text-2xl font-semibold mt-6 mb-3">{line.substring(3)}</h2>
      );
      return;
    }
    
    if (line.startsWith('### ')) {
      // Close any open list
      if (inList) {
        renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      
      renderedContent.push(
        <h3 key={index} className="text-xl font-semibold mt-5 mb-2">{line.substring(4)}</h3>
      );
      return;
    }
    
    // Check for list items
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listText = line.trim().startsWith('- ') 
        ? formatInlineElements(line.substring(line.indexOf('- ') + 2))
        : formatInlineElements(line.substring(line.indexOf('* ') + 2));
      
      inList = true;
      listItems.push(<li key={`item-${index}`}>{listText}</li>);
      return;
    }
    
    // Process paragraphs - handle inline formatting
    if (inList) {
      renderedContent.push(<ul key={`list-${index}`} className="list-disc pl-5 my-4">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
    
    renderedContent.push(
      <p key={index} className="my-2">
        {formatInlineElements(line)}
      </p>
    );
  });
  
  // Close any open list at the end
  if (inList && listItems.length > 0) {
    renderedContent.push(<ul key={`list-end`} className="list-disc pl-5 my-4">{listItems}</ul>);
  }
  
  return <>{renderedContent}</>;
}

// Function to format inline elements like bold, italic, and links
function formatInlineElements(text: string) {
  const boldPattern = /\*\*(.*?)\*\*/g;
  const italicPattern = /\*(.*?)\*/g;
  const linkPattern = /\[(.*?)\]\((.*?)\)/g;
  
  let formattedText = text;
  
  // Replace bold text
  formattedText = formattedText.replace(boldPattern, '<strong>$1</strong>');
  
  // Replace italic text
  formattedText = formattedText.replace(italicPattern, '<em>$1</em>');
  
  // Replace links
  formattedText = formattedText.replace(linkPattern, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
}