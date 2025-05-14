'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, FileText, Plus, Loader2, Book, Map, MessageSquare, Headphones } from 'lucide-react';
import AuthContext from '@/app/context/AuthContext';

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

interface StudyPlanSection {
  title: string;
  description: string;
  topics: string[];
  resources: any[];
  activities: string[];
  estimated_time: string;
  assessment_methods: string[];
}

interface StudyPlan {
  id: number;
  topic: string;
  overview: string;
  learning_objectives: string[];
  sections: StudyPlanSection[];
  total_estimated_time: string;
  created_at: string;
}

// Define the new Interview interface
interface Interview {
  id: number;
  role: string;
  type: string;
  level: string;
  techstack: string;
  questions: string;
  user_id: number;
  created_at: string;
}

export default function ProfilePage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [loadingStudyPlans, setLoadingStudyPlans] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [errorTests, setErrorTests] = useState<string | null>(null);
  const [errorSummaries, setErrorSummaries] = useState<string | null>(null);
  const [errorStudyPlans, setErrorStudyPlans] = useState<string | null>(null);
  const [errorInterviews, setErrorInterviews] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'summaries' | 'roadmaps' | 'interviews'>('tests');
  const router = useRouter();
  const { user } = useContext(AuthContext) || {}; // Get user from context
  
  useEffect(() => {
    // Original fetchTests and fetchSummaries functions remain unchanged
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
    
    // New function to fetch study plans
    async function fetchStudyPlans() {
      setLoadingStudyPlans(true);
      setErrorStudyPlans(null);
      
      try {
        // Get authentication token from localStorage
        const authTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
        const token = authTokens.access_token;
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in.');
        }
        
        // Fetch study plans from API
        const response = await fetch('http://localhost:8000/studyplan/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch study plans: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setStudyPlans(data);
      } catch (err) {
        console.error('Error fetching study plans:', err);
        setErrorStudyPlans(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingStudyPlans(false);
      }
    }

    // New function to fetch interviews
    async function fetchInterviews() {
      setLoadingInterviews(true);
      setErrorInterviews(null);
      
      try {
        // Get authentication token from localStorage
        const authTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
        const token = authTokens.access_token;
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in.');
        }
        
        // Fetch interviews from API
        const response = await fetch('http://localhost:8000/interviews/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch interviews: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setInterviews(data);
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setErrorInterviews(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingInterviews(false);
      }
    }
    
    fetchTests();
    fetchSummaries();
    fetchStudyPlans();
    fetchInterviews();
  }, []);

  // Handle navigation
  const handleTestClick = (testId: number) => {
    router.push(`/questions/${testId}`);
  };
  
  const handleSummaryClick = (summaryId: number) => {
    router.push(`/summaries/${summaryId}`);
  };
  
  const handleStudyPlanClick = (planId: number) => {
    router.push(`/roadmaps/${planId}`);
  };

  const handleInterviewClick = (interviewId: number) => {
    router.push(`/interviews/${interviewId}`);
  };

  // Helper functions
  const getShortenedContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Update the parseTechStack function in your profile/page.tsx file
  const parseTechStack = (techstack: string): string[] => {
    if (!techstack) {
      return [];  // Return empty array if techstack is null, undefined or empty
    }
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(techstack);
      
      // Check if the parsed value is already an array
      if (Array.isArray(parsed)) {
        return parsed;
      } 
      // If it's a string, split by comma and trim
      else if (typeof parsed === 'string') {
        return parsed.split(',').map(tech => tech.trim()).filter(tech => tech);
      }
      // If it's some other object, return it in array
      return [String(parsed)];
    } catch (e) {
      // If parsing fails, treat as comma-separated string
      if (typeof techstack === 'string') {
        return techstack.split(',').map(tech => tech.trim()).filter(tech => tech);
      }
      // Fallback: return as single item array
      return [String(techstack)];
    }
  };
  
  // Count questions in an interview
  const countQuestions = (questionsStr: string): number => {
    try {
      if (questionsStr.includes('```json')) {
        const jsonString = questionsStr.split('```json')[1].split('```')[0].trim();
        const parsed = JSON.parse(JSON.parse(jsonString));
        return Array.isArray(parsed) ? parsed.length : 1;
      } else if (questionsStr.startsWith('[')) {
        const parsed = JSON.parse(questionsStr);
        return Array.isArray(parsed) ? parsed.length : 1;
      }
      return 1;
    } catch (e) {
      return 1;
    }
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
        
        {/* Tabs for switching between Tests, Summaries, Study Plans, and Interviews */}
        <div className="flex justify-center mb-8 border-b overflow-x-auto">
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
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === 'roadmaps' 
                ? 'border-b-2 border-[#2C3E50] text-[#2C3E50]' 
                : 'text-gray-500 hover:text-[#2C3E50]'
            }`}
          >
            <div className="flex items-center">
              <Map className="w-5 h-5 mr-2" />
              Roadmaps
            </div>
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === 'interviews' 
                ? 'border-b-2 border-[#2C3E50] text-[#2C3E50]' 
                : 'text-gray-500 hover:text-[#2C3E50]'
            }`}
          >
            <div className="flex items-center">
              <Headphones className="w-5 h-5 mr-2" />
              Interviews
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
                      <div className="h-2 bg-[#2C3E50]"></div>
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
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#434d58] transition duration-200"
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

        {/* Study Plans Tab Content */}
        {activeTab === 'roadmaps' && (
          <>
            {loadingStudyPlans ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
              </div>
            ) : errorStudyPlans ? (
              <div className="bg-[#FAEBEA] border border-[#E74C3C] text-[#E74C3C] px-6 py-4 rounded-lg max-w-2xl mx-auto mb-8">
                <p className="font-medium">{errorStudyPlans}</p>
              </div>
            ) : studyPlans.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md max-w-lg mx-auto">
                <Map className="h-16 w-16 text-[#4A90E2] mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">No learning roadmaps found</h2>
                <p className="mt-2 text-[#4A4A4A]">Create your first roadmap to get started!</p>
                <button
                  onClick={() => router.push('/roadmaps/create')}
                  className="mt-6 inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#3c4146] transition duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Roadmap
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {studyPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02] transition-transform"
                      onClick={() => handleStudyPlanClick(plan.id)}
                    >
                      <div className="h-2 bg-[#2C3E50]"></div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 capitalize">{plan.topic}</h3>
                        <div className="mb-3">
                          <span className="text-xs inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2.5 py-0.5">
                            <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {plan.total_estimated_time || 'Varies'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {getShortenedContent(plan.overview, 100)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#4A4A4A]">
                            {formatDate(plan.created_at)}
                          </span>
                          <button
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#434d58] transition duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudyPlanClick(plan.id);
                            }}
                          >
                            <Map className="w-4 h-4 mr-1" />
                            View Roadmap
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8 mb-12">
                  <button
                    onClick={() => router.push('/roadmaps/create')}
                    className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#474e56] transition duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Generate New Roadmap
                  </button>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Interviews Tab Content */}
        {activeTab === 'interviews' && (
          <>
            {loadingInterviews ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
              </div>
            ) : errorInterviews ? (
              <div className="bg-[#FAEBEA] border border-[#E74C3C] text-[#E74C3C] px-6 py-4 rounded-lg max-w-2xl mx-auto mb-8">
                <p className="font-medium">{errorInterviews}</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md max-w-lg mx-auto">
                <Headphones className="h-16 w-16 text-[#4A90E2] mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">No interview practice sessions found</h2>
                <p className="mt-2 text-[#4A4A4A]">Create your first interview practice to get started!</p>
                <button
                  onClick={() => router.push('/interviews/create')}
                  className="mt-6 inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#3c4146] transition duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Interview
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02] transition-transform"
                      onClick={() => handleInterviewClick(interview.id)}
                    >
                      <div className="h-2 bg-[#2C3E50]"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold truncate capitalize">
                            {interview.role} Interview
                          </h3>
                          <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                            {interview.level}
                          </span>
                        </div>
                        
                        <div className="mb-3 flex flex-wrap gap-1">
                          {parseTechStack(interview.techstack).map((tech, i) => (
                            <span 
                              key={i} 
                              className="text-xs bg-blue-50 text-blue-700 rounded-md px-2 py-1"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          <span>{countQuestions(interview.questions)} questions</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{interview.type}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#4A4A4A]">
                            {formatDate(interview.created_at)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInterviewClick(interview.id);
                              }}
                            >
                              <Headphones className="w-3 h-3 mr-1" />
                              Practice
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/interviews/${interview.id}/review`);
                              }}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Review
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8 mb-12">
                  <button
                    onClick={() => router.push('/interviews/create')}
                    className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#2C3E50] hover:bg-[#474e56] transition duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Interview
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