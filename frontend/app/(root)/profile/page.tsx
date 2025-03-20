'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, FileText, Plus, Loader2, Book } from 'lucide-react';

// Define interfaces
interface Test {
  id: number;
  title: string;
  user_id: number;
}

interface Summary {
  id: number;
  content: string;
  original_filename: string;
  word_count: number;
  detail_level: string;
  created_at: string;
}

export default function ProfilePage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [errorTests, setErrorTests] = useState<string | null>(null);
  const [errorSummaries, setErrorSummaries] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'summaries'>('tests');
  const router = useRouter();

  useEffect(() => {
    async function fetchTests() {
      setLoadingTests(true);
      setErrorTests(null);
      
      try {
        // Get authentication token from localStorage
        const authTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
        const token = authTokens.access_token;
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in.');
        }
        
        // Fetch tests from API
        const response = await fetch('http://localhost:8000/questions/my-tests', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tests: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setTests(data);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setErrorTests(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingTests(false);
      }
    }
    
    async function fetchSummaries() {
      setLoadingSummaries(true);
      setErrorSummaries(null);
      
      try {
        // Get authentication token from localStorage
        const authTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
        const token = authTokens.access_token;
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in.');
        }
        
        // Fetch summaries from API
        const response = await fetch('http://localhost:8000/summary', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch summaries: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setSummaries(data);
      } catch (err) {
        console.error('Error fetching summaries:', err);
        setErrorSummaries(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingSummaries(false);
      }
    }
    
    fetchTests();
    fetchSummaries();
  }, []);

  // Handle navigation
  const handleTestClick = (testId: number) => {
    router.push(`/questions/${testId}`);
  };
  
  const handleSummaryClick = (summaryId: number) => {
    router.push(`/summaries/${summaryId}`);
  };

  // Get shortened content for summary preview
  const getShortenedContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-10 px-4 text-[#2C3E50] overflow-hidden">
      {/* Background Art */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#E0E6ED] rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#2C3E50] rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#CCD6E0] rounded-full opacity-40 blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl z-10">
        <h1 className="text-4xl font-extrabold mb-2 text-center">My Dashboard</h1>
        
        {/* Tabs for switching between Tests and Summaries */}
        <div className="flex justify-center mb-8 border-b">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === 'tests' 
                ? 'border-b-2 border-[#2C3E50] text-[#2C3E50]' 
                : 'text-gray-500 hover:text-[#2C3E50]'
            }`}
          >
            <div className="flex items-center">
              <FileCheck className="w-5 h-5 mr-2" />
              Tests
            </div>
          </button>
          <button
            onClick={() => setActiveTab('summaries')}
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === 'summaries' 
                ? 'border-b-2 border-[#2C3E50] text-[#2C3E50]' 
                : 'text-gray-500 hover:text-[#2C3E50]'
            }`}
          >
            <div className="flex items-center">
              <Book className="w-5 h-5 mr-2" />
              Summaries
            </div>
          </button>
        </div>

        {/* Tests Tab Content */}
        {activeTab === 'tests' && (
          <>
            {loadingTests ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
              </div>
            ) : errorTests ? (
              <div className="bg-[#FAEBEA] border border-[#E74C3C] text-[#E74C3C] px-6 py-4 rounded-lg max-w-2xl mx-auto mb-8">
                <p className="font-medium">{errorTests}</p>
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md max-w-lg mx-auto">
                <FileCheck className="h-16 w-16 text-[#4A90E2] mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">No tests found</h2>
                <p className="mt-2 text-[#4A4A4A]">Create your first test to get started!</p>
                <button
                  onClick={() => router.push('/questions/create')}
                  className="mt-6 inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#3c4146] transition duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Test
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {tests.map((test, index) => (
                    <div
                      key={test.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02] transition-transform"
                      onClick={() => handleTestClick(test.id)}
                    >
                      <div className="h-2 bg-[#2C3E50]"></div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-3 capitalize">{test.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#4A4A4A]">Test #{index + 1}</span>
                          <button
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#3a4753] transition duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestClick(test.id);
                            }}
                          >
                            <FileCheck className="w-4 h-4 mr-1" />
                            Take Test
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8 mb-12">
                  <button
                    onClick={() => router.push('/questions/create')}
                    className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#474e56] transition duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Generate New Test
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Summaries Tab Content */}
        {activeTab === 'summaries' && (
          <>
            {loadingSummaries ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
              </div>
            ) : errorSummaries ? (
              <div className="bg-[#FAEBEA] border border-[#E74C3C] text-[#E74C3C] px-6 py-4 rounded-lg max-w-2xl mx-auto mb-8">
                <p className="font-medium">{errorSummaries}</p>
              </div>
            ) : summaries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md max-w-lg mx-auto">
                <Book className="h-16 w-16 text-[#4A90E2] mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">No summaries found</h2>
                <p className="mt-2 text-[#4A4A4A]">Create your first summary to get started!</p>
                <button
                  onClick={() => router.push('/summaries/create')}
                  className="mt-6 inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#3c4146] transition duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Summary
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {summaries.map((summary) => (
                    <div
                      key={summary.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02] transition-transform"
                      onClick={() => handleSummaryClick(summary.id)}
                    >
                      <div className="h-2 bg-[#4A90E2]"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold truncate">
                            {summary.original_filename || 'Summary'}
                          </h3>
                          <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                            {summary.detail_level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                          {getShortenedContent(summary.content)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#4A4A4A]">
                            {formatDate(summary.created_at)}
                          </span>
                          <button
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3a7ac4] transition duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSummaryClick(summary.id);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8 mb-12">
                  <button
                    onClick={() => router.push('/summaries/create')}
                    className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#474e56] transition duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Generate New Summary
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}