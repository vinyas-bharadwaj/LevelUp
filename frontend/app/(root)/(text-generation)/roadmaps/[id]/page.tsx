'use client';

import { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthContext from '@/app/context/AuthContext';
import { 
  Map, 
  Loader2, 
  Clock, 
  FileText, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Target, 
  ExternalLink 
} from 'lucide-react';

// Type definitions based on your API response
interface StudyPlanResource {
  title: string;
  url: string;
  description: string;
  type: string;
}

interface StudyPlanSection {
  title: string;
  description: string;
  topics: string[];
  resources: StudyPlanResource[];
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

export default function RoadmapPage() {
  const { id } = useParams();
  const router = useRouter();
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  const { user } = useContext(AuthContext) || {};
  
  useEffect(() => {
    const fetchStudyPlan = async () => {
      setIsLoading(true);
      
      try {
        if (!user) {
          setError("You need to be logged in to view this roadmap");
          setIsLoading(false);
          router.push('/login');
          return;
        }
        
        const authTokensStr = localStorage.getItem('authTokens');
        if (!authTokensStr) {
          setError("Authentication token not found");
          setIsLoading(false);
          router.push('/login');
          return;
        }
        
        const authTokens = JSON.parse(authTokensStr);
        const token = authTokens.access_token;
        
        const response = await fetch(`http://127.0.0.1:8000/studyplan/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to load roadmap with ID ${id}`);
        }
        
        const data = await response.json();
        setStudyPlan(data);
        
        // Initialize all sections as open
        const initialOpenState: Record<number, boolean> = {};
        data.sections.forEach((_: any, index: number) => {
          initialOpenState[index] = true;
        });
        setOpenSections(initialOpenState);
        
      } catch (err) {
        console.error('Error fetching study plan:', err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchStudyPlan();
    }
  }, [id, user, router]);
  
  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center pt-10 px-4 text-[#2C3E50] overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 bg-[#E0E6ED] rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#2C3E50] rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#CCD6E0] rounded-full opacity-40 blur-2xl"></div>
        </div>
        <div className="flex flex-col items-center justify-center w-full max-w-4xl">
          <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
          <p className="mt-4 text-lg text-[#2C3E50]">Loading your roadmap...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error || !studyPlan) {
    return (
      <div className="relative min-h-screen flex flex-col items-center pt-10 px-4 text-[#2C3E50] overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 bg-[#E0E6ED] rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#2C3E50] rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#CCD6E0] rounded-full opacity-40 blur-2xl"></div>
        </div>
        <div className="w-full max-w-4xl z-10">
          <div className="bg-[#FAEBEA] border-l-4 border-[#E74C3C] px-6 py-5 rounded-lg shadow-md">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-[#E74C3C]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-[#E74C3C]">Error Loading Roadmap</h3>
                <p className="mt-2 text-[#E74C3C]">{error || "Could not load the roadmap. Please try again."}</p>
                <div className="mt-4">
                  <button 
                    onClick={() => router.push('/profile')}
                    className="inline-flex items-center px-4 py-2 bg-[#2C3E50] hover:bg-[#4A4A4A] text-white rounded-md transition duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Format the date
  const formattedDate = new Date(studyPlan.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-10 px-4 text-[#2C3E50] overflow-hidden">
      {/* Background Art */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#E0E6ED] rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#2C3E50] rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#CCD6E0] rounded-full opacity-40 blur-2xl"></div>
      </div>
      
      <div className="w-full max-w-4xl z-10 mb-16">
        {/* Back Navigation */}
        <Link
          href="/profile"
          className="inline-flex items-center text-[#4A90E2] hover:text-[#2C3E50] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        {/* Header */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#2C3E50] to-[#4A90E2] px-6 py-6">
            <div className="flex items-center mb-2">
              <Map className="h-7 w-7 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">{studyPlan.topic}</h1>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{studyPlan.total_estimated_time}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Created on {formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Overview */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <BookOpen className="h-5 w-5 text-[#4A90E2] mr-2" />
            <h2 className="text-xl font-semibold text-[#2C3E50]">Overview</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700">{studyPlan.overview}</p>
          </div>
        </div>
        
        {/* Learning Objectives */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <Target className="h-5 w-5 text-[#4A90E2] mr-2" />
            <h2 className="text-xl font-semibold text-[#2C3E50]">Learning Objectives</h2>
          </div>
          <div className="px-6 py-4">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {studyPlan.learning_objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Roadmap Sections */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#2C3E50] px-2">Learning Path</h2>
          
          <div className="space-y-4">
            {studyPlan.sections.map((section, index) => (
              <div key={index} className="bg-white shadow-md rounded-xl overflow-hidden">
                {/* Section Header */}
                <button 
                  className="w-full px-6 py-4 flex justify-between items-center focus:outline-none bg-gray-50"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-[#4A90E2]/10 flex items-center justify-center text-[#4A90E2] font-semibold mr-3">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-[#2C3E50]">{section.title}</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-[#4A90E2]/10 text-[#4A90E2] text-xs font-semibold mr-3 px-2.5 py-1 rounded-full flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {section.estimated_time}
                    </span>
                    {openSections[index] ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {/* Section Content */}
                {openSections[index] && (
                  <div className="border-t border-gray-100">
                    <div className="px-6 py-4 space-y-6">
                      {/* Section Description */}
                      <p className="text-gray-600">{section.description}</p>
                      
                      {/* Key Topics */}
                      {section.topics && section.topics.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-[#2C3E50] flex items-center">
                            <svg className="h-4 w-4 mr-2 text-[#4A90E2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Key Topics
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {section.topics.map((topic, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-gray-700">
                                <svg className="h-5 w-5 text-[#4A90E2] flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <hr className="border-gray-100" />
                      
                      {/* Resources */}
                      {section.resources && section.resources.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-[#2C3E50]">Recommended Resources</h4>
                          <div className="grid gap-4">
                            {section.resources.map((resource, idx) => (
                              <div key={idx} className="border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition">
                                <div className="p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1 mb-2 sm:mb-0">
                                      <div className="flex items-baseline gap-2">
                                        <h5 className="font-medium text-[#2C3E50]">{resource.title}</h5>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {resource.type}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-500">{resource.description}</p>
                                    </div>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-md text-[#4A90E2] bg-white hover:bg-gray-50 transition"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                      Open
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Activities */}
                      {section.activities && section.activities.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-[#2C3E50]">Practice Activities</h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            {section.activities.map((activity, idx) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Assessment Methods */}
                      {section.assessment_methods && section.assessment_methods.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-[#2C3E50]">Assessment Methods</h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            {section.assessment_methods.map((method, idx) => (
                              <li key={idx}>{method}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Quick Reference Button */}
          <div className="flex justify-center pt-4">
            <Link
              href={`/roadmaps/${id}/reference`}
              className="inline-flex items-center px-5 py-2.5 bg-[#4A90E2] hover:bg-[#2C3E50] text-white font-medium rounded-md transition-colors shadow-md"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Quick Reference Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add the missing Calendar component
const Calendar = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={props.width || props.size || "24"} 
    height={props.height || props.size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={props.className || ""}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);