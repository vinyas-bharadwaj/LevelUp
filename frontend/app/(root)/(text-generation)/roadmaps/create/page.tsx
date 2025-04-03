'use client';

import { useState, FormEvent, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthContext from '@/app/context/AuthContext';
import { Map, Loader2, ArrowLeft, Lightbulb, Book, GraduationCap } from 'lucide-react';

export default function CreateRoadmapPage() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useContext(AuthContext) || {}; 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        setError("You need to be logged in to create a roadmap");
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

      const response = await fetch("http://127.0.0.1:8000/studyplan/generate-studyplan/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create study plan");
      }

      const studyPlan = await response.json();
      
      setSuccess(`Your "${topic}" roadmap has been created!`);
      
      // Redirect to the roadmap view page using the ID from the response
      setTimeout(() => {
        router.push(`/roadmaps/${studyPlan.id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error creating study plan:', err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/profile"
        className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-5">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Map className="mr-3 h-6 w-6" />
            Create Learning Roadmap
          </h1>
          <p className="text-gray-200 mt-1">Generate a personalized learning path for any topic</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                What do you want to learn?
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  id="topic"
                  type="text"
                  placeholder="Enter a topic (e.g. Machine Learning, Quantum Physics, Spanish)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading || !user}
                  required
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-500 text-gray-900"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Lightbulb className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Features list */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your roadmap will include:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Comprehensive learning objectives</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Step-by-step learning sections</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Curated learning resources</span>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Practice activities and assessments</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500 italic flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generation takes up to a minute
              </p>
              <button
                type="submit"
                disabled={isLoading || !user}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm ${isLoading || !user ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-gray-800 hover:bg-gray-700 text-white'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Map className="h-4 w-4 mr-2" />
                    Generate Roadmap
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Examples */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Popular topics to try:</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setTopic("Machine Learning for Beginners")}
                disabled={isLoading || !user}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Machine Learning
              </button>
              <button 
                onClick={() => setTopic("Web Development with React")}
                disabled={isLoading || !user}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                React Development
              </button>
              <button 
                onClick={() => setTopic("Data Science Career Path")}
                disabled={isLoading || !user}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Data Science
              </button>
              <button 
                onClick={() => setTopic("Spanish Language Learning")}
                disabled={isLoading || !user}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Spanish Language
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Not logged in warning */}
      {!user && (
        <div className="mt-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You need to be logged in to create a roadmap.{' '}
                  <Link href="/login" className="font-medium text-yellow-700 underline hover:text-yellow-600">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why create a roadmap section - only shown when not loading */}
      {!isLoading && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Why create a learning roadmap?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <GraduationCap className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Structured Learning</h3>
              <p className="text-sm text-gray-600">Follow a clear path from beginner to advanced with organized learning steps.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <Book className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Curated Resources</h3>
              <p className="text-sm text-gray-600">Get recommended books, courses, and articles tailored to your learning journey.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <Map className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Track Progress</h3>
              <p className="text-sm text-gray-600">See your learning path clearly and track your progress as you advance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}