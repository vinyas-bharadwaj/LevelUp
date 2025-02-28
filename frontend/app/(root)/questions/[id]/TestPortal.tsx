'use client';

import React, { useState } from 'react';

interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
}

interface TestPortalProps {
  questions: Question[];
  testId: string;
}

export default function TestPortal({ questions, testId }: TestPortalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  const handleOptionSelect = (questionIndex: number, option: string) => {
    if (submitted) return; 
    
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = option;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (question.answer === selectedAnswers[index]) {
        correctCount++;
      }
    });
    
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    setSubmitted(true);
  };

  const toggleShowAnswers = () => {
    setShowCorrectAnswers(!showCorrectAnswers);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {submitted && score !== null && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-bold text-blue-800">Test Results</h2>
          <p className="text-lg">
            Your score: {score.toFixed(1)}% ({Math.round(score * questions.length / 100)} out of {questions.length} correct)
          </p>
          <button 
            onClick={toggleShowAnswers}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {showCorrectAnswers ? 'Hide Answers' : 'Show Correct Answers'}
          </button>
        </div>
      )}

      <form>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className={`mb-8 p-4 rounded-lg ${submitted ? (question.answer === selectedAnswers[qIndex] ? 'bg-green-50' : 'bg-red-50') : 'bg-gray-50'}`}>
            <p className="font-semibold text-lg mb-3">
              {qIndex + 1}. {question.question}
            </p>
            
            <div className="space-y-2">
              {['a', 'b', 'c', 'd'].map((option) => (
                <label 
                  key={option}
                  className={`flex items-start p-2 rounded cursor-pointer ${
                    submitted && showCorrectAnswers && question.answer === option
                      ? 'bg-green-100 border border-green-400'
                      : submitted && selectedAnswers[qIndex] === option && question.answer !== option
                      ? 'bg-red-100 border border-red-400'
                      : selectedAnswers[qIndex] === option
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={option}
                    checked={selectedAnswers[qIndex] === option}
                    onChange={() => handleOptionSelect(qIndex, option)}
                    disabled={submitted}
                    className="mt-1 mr-2"
                  />
                  <div>
                    <span className="font-medium mr-2">{option.toUpperCase()}:</span>
                    <span>{question[`option_${option}` as keyof Question]}</span>
                  </div>
                </label>
              ))}
            </div>
            
            {submitted && showCorrectAnswers && selectedAnswers[qIndex] !== question.answer && (
              <p className="mt-2 text-green-600 font-medium">
                Correct answer: {question.answer.toUpperCase()}
              </p>
            )}
          </div>
        ))}

        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition"
          >
            Submit Test
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md shadow-sm transition"
          >
            Return to Dashboard
          </button>
        )}
      </form>
    </div>
  );
}