'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, Plus, Loader2 } from 'lucide-react';

// Define the Test interface
interface Test {
  id: number;
  title: string;
  user_id: number;
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTests() {
      setLoading(true);
      setError(null);
      
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
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTests();
  }, []);

  // Handle click on a test card
  const handleTestClick = (testId: number) => {
    router.push(`/questions/${testId}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-10 px-4 text-[#2C3E50] overflow-hidden">
      {/* Background Art */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#E0E6ED] rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#4A90E2] rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#CCD6E0] rounded-full opacity-40 blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl z-10">
        <h1 className="text-4xl font-extrabold mb-2 text-center">My Tests</h1>
        <div className="text-sm text-[#4A4A4A] text-center mb-8">
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
          </div>
        ) : error ? (
          <div className="bg-[#FAEBEA] border border-[#E74C3C] text-[#E74C3C] px-6 py-4 rounded-lg max-w-2xl mx-auto mb-8">
            <p className="font-medium">{error}</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md max-w-lg mx-auto">
            <FileCheck className="h-16 w-16 text-[#4A90E2] mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">No tests found</h2>
            <p className="mt-2 text-[#4A4A4A]">Create your first test to get started!</p>
            <button
              onClick={() => router.push('/questions/create')}
              className="mt-6 inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3A7BCC] transition duration-200"
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
                  <div className="h-2 bg-[#4A90E2]"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 capitalize">{test.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#4A4A4A]">Test #{index + 1}</span>
                      <button
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3A7BCC] transition duration-200"
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
                className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3A7BCC] transition duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate New Test
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}