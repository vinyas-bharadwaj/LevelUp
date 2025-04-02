import TestPortal from '@/app/(root)/questions/[id]/TestPortal';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Test Generation",
    description: "Generating questions based on the input file",
}

interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
}

async function getTestQuestions(testId: string): Promise<Question[]> {
  const res = await fetch(`http://localhost:8000/questions/${testId}`, {
    cache: 'no-store', 
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch questions for test ${testId}`);
  }
  
  return res.json();
}

export default async function QuestionsPage({ params }: { params: { id: string } }) {
  const testId = params.id;
  
  const questions = await getTestQuestions(testId);
  
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const currentUser = "vinyas-bharadwaj"; 
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test Questions</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Test ID: {testId}</p>
        <p className="text-sm text-gray-600">Date: {currentDate}</p>
        <p className="text-sm text-gray-600">User: {currentUser}</p>
      </div>
      
      <TestPortal questions={questions} testId={testId} />
    </div>
  );
}