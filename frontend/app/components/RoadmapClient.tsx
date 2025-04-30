'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Clock, 
  FileText, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Target, 
  ExternalLink,
  Award,
  Compass
} from 'lucide-react';

// Type definitions remain the same
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

interface RoadmapClientProps {
  studyPlan: StudyPlan;
  formattedDate: string;
}

export default function RoadmapClient({ studyPlan, formattedDate }: RoadmapClientProps) {
  const router = useRouter();
  const initialOpenState: Record<number, boolean> = {};
  studyPlan.sections.forEach((_: any, index: number) => {
    initialOpenState[index] = true;
  });
  const [openSections, setOpenSections] = useState<Record<number, boolean>>(initialOpenState);
  
  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Resource type badges with colors
  const resourceTypeColors: Record<string, string> = {
    'Video': 'bg-blue-100 text-blue-800',
    'Article': 'bg-green-100 text-green-800',
    'Book': 'bg-purple-100 text-purple-800',
    'Course': 'bg-yellow-100 text-yellow-800',
    'Tool': 'bg-indigo-100 text-indigo-800',
    'Documentation': 'bg-gray-100 text-gray-800',
    'Tutorial': 'bg-teal-100 text-teal-800',
    'Quiz': 'bg-pink-100 text-pink-800',
    'Exercise': 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      {/* Hero section with gradient background */}
      <div className="relative rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-8 shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <Compass className="w-full h-full text-indigo-600" />
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
        <h1 className="text-3xl font-bold mb-3 text-gray-800 leading-tight">{studyPlan.topic}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-2">
          <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
            <Clock className="h-4 w-4 mr-2 text-indigo-500" />
            <span className="font-medium">{studyPlan.total_estimated_time}</span>
          </div>
          <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
            <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
            <span>Created on {formattedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center bg-white">
              <BookOpen className="h-5 w-5 text-indigo-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
            </div>
            <div className="px-5 py-4 bg-white">
              <p className="text-gray-700 leading-relaxed">{studyPlan.overview}</p>
            </div>
          </div>
          
          {/* Learning Path Sections */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Compass className="h-5 w-5 mr-2 text-indigo-500" />
              Learning Path
            </h2>
            
            {studyPlan.sections.map((section, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg">
                {/* Section Header */}
                <button 
                  className="w-full px-5 py-4 flex justify-between items-center focus:outline-none bg-white"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold mr-3 shadow-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-800">{section.title}</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-medium mr-3 px-3 py-1 rounded-full flex items-center shadow-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {section.estimated_time}
                    </span>
                    {openSections[index] ? (
                      <ChevronUp className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                </button>
                
                {/* Section Content with smooth animation */}
                {openSections[index] && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <div className="space-y-5">
                      {/* Section Description */}
                      <p className="text-gray-700 leading-relaxed">{section.description}</p>
                      
                      {/* Key Topics */}
                      {section.topics && section.topics.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <span className="bg-indigo-100 rounded-md p-1 mr-2">
                              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </span>
                            Key Topics
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {section.topics.map((topic, idx) => (
                              <div key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                                <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                  <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="text-gray-700">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-100 pt-4"></div>
                      
                      {/* Resources with cards */}
                      {section.resources && section.resources.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <span className="bg-indigo-100 rounded-md p-1 mr-2">
                              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </span>
                            Recommended Resources
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {section.resources.map((resource, idx) => (
                              <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                  <div className="space-y-2 flex-grow">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className="font-medium text-gray-800">{resource.title}</h5>
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resourceTypeColors[resource.type] || 'bg-gray-100 text-gray-800'}`}>
                                        {resource.type}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                                  </div>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors shadow-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                    Open Resource
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Activities in a visual list */}
                      {section.activities && section.activities.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <span className="bg-indigo-100 rounded-md p-1 mr-2">
                              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </span>
                            Practice Activities
                          </h4>
                          <div className="bg-indigo-50 rounded-lg p-4">
                            <ul className="space-y-2">
                              {section.activities.map((activity, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="bg-white rounded-full h-6 w-6 flex items-center justify-center border border-indigo-200 mt-0.5 flex-shrink-0">
                                    <span className="text-xs font-semibold text-indigo-600">{idx + 1}</span>
                                  </div>
                                  <span className="text-gray-700">{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {/* Assessment Methods with icons */}
                      {section.assessment_methods && section.assessment_methods.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <span className="bg-indigo-100 rounded-md p-1 mr-2">
                              <Award className="h-4 w-4 text-indigo-600" />
                            </span>
                            Assessment Methods
                          </h4>
                          <div className="bg-white border border-indigo-100 rounded-lg p-4">
                            <ul className="grid grid-cols-1 gap-2">
                              {section.assessment_methods.map((method, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-gray-700">
                                  <div className="bg-indigo-100 rounded-full p-1 flex-shrink-0">
                                    <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  {method}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sidebar with Learning Objectives */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 sticky top-4">
            <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50 flex items-center">
              <Target className="h-5 w-5 text-indigo-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">Learning Objectives</h2>
            </div>
            <div className="px-5 py-4">
              <ul className="space-y-3">
                {studyPlan.learning_objectives.map((objective, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="bg-indigo-100 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-indigo-600">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Quick Reference Button */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <Link
                href={`/roadmaps/${studyPlan.id}/reference`}
                className="flex items-center justify-center w-full px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Quick Reference Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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