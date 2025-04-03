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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          <p className="mt-4 text-lg">Loading your roadmap...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error || !studyPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Roadmap</h3>
              <p className="mt-2 text-sm text-red-700">{error || "Could not load the roadmap. Please try again."}</p>
              <div className="mt-4">
                <button 
                  onClick={() => router.push('/profile')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </button>
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
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link
        href="/profile"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
      
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">{studyPlan.topic}</h1>
      <div className="mb-4">
        <div className="text-sm text-gray-600 flex items-center gap-4">
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
      
      {/* Overview */}
      <div className="bg-white shadow rounded mb-6">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center">
          <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-medium">Overview</h2>
        </div>
        <div className="px-4 py-3">
          <p className="text-gray-700">{studyPlan.overview}</p>
        </div>
      </div>
      
      {/* Learning Objectives */}
      <div className="bg-white shadow rounded mb-6">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center">
          <Target className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-medium">Learning Objectives</h2>
        </div>
        <div className="px-4 py-3">
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {studyPlan.learning_objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Roadmap Sections */}
      <h2 className="text-xl font-semibold mb-4">Learning Path</h2>
      
      <div className="space-y-4 mb-6">
        {studyPlan.sections.map((section, index) => (
          <div key={index} className="bg-white shadow rounded">
            {/* Section Header */}
            <button 
              className="w-full px-4 py-3 flex justify-between items-center focus:outline-none"
              onClick={() => toggleSection(index)}
            >
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                  {index + 1}
                </div>
                <h3 className="font-medium">{section.title}</h3>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-100 text-gray-700 text-xs font-medium mr-3 px-2 py-0.5 rounded-full flex items-center">
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
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="space-y-4">
                  {/* Section Description */}
                  <p className="text-gray-700">{section.description}</p>
                  
                  {/* Key Topics */}
                  {section.topics && section.topics.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">Key Topics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {section.topics.map((topic, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-gray-700">
                            <svg className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <hr className="border-gray-200" />
                  
                  {/* Resources */}
                  {section.resources && section.resources.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Recommended Resources</h4>
                      <div className="space-y-2">
                        {section.resources.map((resource, idx) => (
                          <div key={idx} className="border border-gray-200 rounded p-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-1 mb-2 sm:mb-0">
                                <div className="flex items-baseline gap-2">
                                  <h5 className="font-medium">{resource.title}</h5>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {resource.type}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{resource.description}</p>
                              </div>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Open
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Activities */}
                  {section.activities && section.activities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Practice Activities</h4>
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
                      <h4 className="font-medium">Assessment Methods</h4>
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
      <div className="flex justify-center mt-6">
        <Link
          href={`/roadmaps/${id}/reference`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Quick Reference Guide
        </Link>
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