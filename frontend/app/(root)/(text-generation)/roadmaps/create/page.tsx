'use client';

import { useState, FormEvent, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthContext from '@/app/context/AuthContext';
import { Map, Loader2, ArrowLeft } from 'lucide-react';

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
    <div className="relative min-h-screen flex flex-col items-center pt-10 px-4 text-[#2C3E50] overflow-hidden">
      {/* Background Art */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#E0E6ED] rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#2C3E50] rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#CCD6E0] rounded-full opacity-40 blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl z-10">
        <Link
          href="/profile"
          className="inline-flex items-center text-[#4A90E2] hover:text-[#2C3E50] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2C3E50] to-[#4A90E2] px-6 py-4 flex items-center">
            <Map className="h-6 w-6 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">Create Learning Roadmap</h1>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="px-6 py-4">
              <div className="bg-[#FAEBEA] border-l-4 border-[#E74C3C] px-4 py-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-[#E74C3C]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-[#E74C3C] font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="px-6 py-4">
              <div className="bg-[#D4EDDA] border-l-4 border-[#28A745] px-4 py-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-[#28A745]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-[#28A745] font-medium">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-[#2C3E50]">
                    What do you want to learn?
                  </label>
                  <input
                    id="topic"
                    type="text"
                    placeholder="Enter a topic (e.g. Machine Learning, Quantum Physics, Spanish)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading || !user}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2] disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    We'll generate a comprehensive learning roadmap based on your topic.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-500 italic">
                This may take up to a minute to generate.
              </p>
              <button
                type="submit"
                disabled={isLoading || !user}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                  ${isLoading || !user ? 'bg-[#90B1DB] cursor-not-allowed' : 'bg-[#4A90E2] hover:bg-[#2C3E50]'} 
                  focus:outline-none transition`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate Roadmap'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Not logged in warning */}
        {!user && (
          <div className="mt-6 bg-[#FFF3CD] border-l-4 border-[#FFCA2C] px-4 py-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-[#856404]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-[#856404]">
                  You need to be logged in to create a roadmap.{' '}
                  <Link href="/login" className="font-medium underline">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}