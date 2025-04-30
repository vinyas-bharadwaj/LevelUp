'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  AlignLeft, 
  FileUp, 
  Layers, 
  Copy 
} from 'lucide-react';

interface Summary {
  id: number
  content: string
  original_filename: string
  word_count: number
  detail_level: string
  created_at: string
}

interface SummaryClientProps {
  summary: Summary;
  formattedDate: string;
}

export default function SummaryClient({ summary, formattedDate }: SummaryClientProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary.content);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const getDetailLevelLabel = (level: string) => {
    switch(level.toLowerCase()) {
      case 'low':
        return 'Basic';
      case 'medium':
        return 'Standard';
      case 'high':
        return 'Comprehensive';
      default:
        return level;
    }
  };
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      {/* Hero section with gradient background */}
      <div className="relative rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-8 shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <FileText className="w-full h-full text-indigo-600" />
        </div>
        
        {/* Back Navigation */}
        <Link
          href="/profile"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        {/* Header with better typography */}
        <h1 className="text-3xl font-bold mb-3 text-gray-800 leading-tight">
          Summary
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
            <FileUp className="h-4 w-4 mr-2 text-indigo-500" />
            <span>{summary.original_filename}</span>
          </div>
          <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
            <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Summary Content */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center">
                <AlignLeft className="h-5 w-5 text-indigo-500 mr-3" />
                <h2 className="text-lg font-semibold text-gray-800">Summary Content</h2>
              </div>
              <button
                onClick={copyToClipboard}
                className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            <div className="px-5 py-4 bg-white">
              <div className="prose prose-indigo max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-800" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2 text-gray-800" {...props} />,
                    p: ({node, ...props}) => <p className="my-3 text-gray-700 leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="my-3 pl-5 list-disc text-gray-700 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="my-3 pl-5 list-decimal text-gray-700 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="my-1" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="pl-4 border-l-4 border-indigo-200 italic my-3 text-gray-600" {...props} />
                    ),
                    a: ({node, href, ...props}) => (
                      <a 
                        href={href} 
                        className="text-indigo-600 hover:underline" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        {...props} 
                      />
                    ),
                    code: ({inline, className, ...props}: {inline?: boolean, className?: string, [key: string]: any}) => (
                      inline 
                        ? <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono text-indigo-700" {...props} />
                        : <code className="block bg-gray-50 p-3 rounded-md text-sm font-mono text-gray-800 overflow-x-auto my-3" {...props} />
                    ),
                    pre: ({node, ...props}) => <pre className="bg-gray-50 rounded-md overflow-hidden my-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-6 border-t border-gray-200" {...props} />,
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                    tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-200" {...props} />,
                    tr: ({node, ...props}) => <tr className="hover:bg-gray-50" {...props} />,
                    th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider" {...props} />,
                    td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-gray-700" {...props} />,
                  }}
                >
                  {summary.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar with Summary Details */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 sticky top-4">
            <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50 flex items-center">
              <Layers className="h-5 w-5 text-indigo-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">Summary Details</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Original File</h3>
                <p className="text-gray-800 font-medium">{summary.original_filename}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Word Count</h3>
                <div className="flex items-center">
                  <span className="text-gray-800 font-medium">{summary.word_count} words</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Detail Level</h3>
                <div className="flex items-center">
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {getDetailLevelLabel(summary.detail_level)}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created On</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                  <span className="text-gray-800">{formattedDate}</span>
                </div>
              </div>
            </div>
            
            {/* Export/Download Button */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center w-full px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}