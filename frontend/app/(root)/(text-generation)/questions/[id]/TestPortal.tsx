'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Home } from 'lucide-react';

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(questions.length * 60); // 1 minute per question
  const [reviewMode, setReviewMode] = useState(false);

  // Timer functionality
  useEffect(() => {
    if (submitted || reviewMode) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, reviewMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const toggleReviewMode = () => {
    setReviewMode(!reviewMode);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto border-2 border-gray-800">
      {/* Header with progress and timer */}
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-[#2C3E50]">
        <h1 className="text-2xl font-bold text-[#2C3E50]">Test #{testId}</h1>
        
        {!submitted && !reviewMode && (
          <div className="flex items-center space-x-2">
            <div className={`text-lg font-mono flex items-center ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-[#4A4A4A]'}`}>
              <Clock className="w-5 h-5 mr-1" />
              {formatTime(timeRemaining)}
            </div>
            <button 
              onClick={toggleReviewMode}
              className="px-3 py-1 text-[#2C3E50] bg-[#E0E6ED] hover:bg-[#CCD6E0] rounded-md transition border border-gray-800"
            >
              Review All
            </button>
          </div>
        )}
      </div>

      {/* Results panel */}
      {submitted && score !== null && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-[#E0E6ED] rounded-lg border-2 border-gray-800 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">Test Results</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-lg text-[#4A4A4A]">
                You scored <span className="font-bold text-[#2C3E50]">{score.toFixed(1)}%</span>
              </p>
              <p className="text-[#4A4A4A]">
                {Math.round(score * questions.length / 100)} out of {questions.length} questions correct
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleShowAnswers}
                className="inline-flex items-center px-4 py-2 text-white bg-[#354554] hover:bg-[#4f5862] rounded-md transition border-2 border-gray-800"
              >
                {showCorrectAnswers ? 'Hide Answers' : 'Show Correct Answers'}
              </button>
              <button
                onClick={toggleReviewMode}
                className="inline-flex items-center px-4 py-2 text-[#2C3E50] bg-[#E0E6ED] hover:bg-[#CCD6E0] rounded-md transition border-2 border-gray-800"
              >
                {reviewMode ? 'Exit Review' : 'Review Questions'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Question navigator (only in review mode or after submission) */}
      {(reviewMode || submitted) && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <button
                key={`nav-${index}`}
                onClick={() => navigateToQuestion(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition border border-gray-800
                  ${currentQuestionIndex === index ? 'ring-2 ring-[#354554] ring-offset-2' : ''}
                  ${!submitted ? 'bg-[#E0E6ED] text-[#2C3E50] hover:bg-[#CCD6E0]' :
                    selectedAnswers[index] === questions[index].answer 
                      ? 'bg-green-100 text-green-800 border-green-500' 
                      : 'bg-red-100 text-red-800 border-red-500'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-sm text-[#4A4A4A]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-500"></div>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-500"></div>
              <span>Incorrect</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#E0E6ED] border border-gray-800"></div>
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      )}

      <form>
        {/* Single question view when not in review mode */}
        {!reviewMode ? (
          <motion.div 
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 p-6 rounded-lg shadow-sm border-2 ${
              submitted 
                ? (questions[currentQuestionIndex].answer === selectedAnswers[currentQuestionIndex] 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-red-50 border-red-500') 
                : 'bg-[#E0E6ED] border-gray-800'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-[#2C3E50]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                  className="inline-flex items-center p-2 text-[#2C3E50] disabled:text-gray-400"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" /> Previous
                </button>
                <button
                  type="button"
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                  className="inline-flex items-center p-2 text-[#2C3E50] disabled:text-gray-400"
                >
                  Next <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
            
            <p className="font-semibold text-xl mb-6 text-[#2C3E50]">
              {questions[currentQuestionIndex].question}
            </p>
            
            <div className="space-y-3">
              {['a', 'b', 'c', 'd'].map((option) => (
                <label 
                  key={option}
                  className={`flex items-start p-3 rounded-md border-2 cursor-pointer transition-all 
                    ${submitted && showCorrectAnswers && questions[currentQuestionIndex].answer === option
                      ? 'bg-green-100 border-green-500'
                      : submitted && selectedAnswers[currentQuestionIndex] === option && questions[currentQuestionIndex].answer !== option
                      ? 'bg-red-100 border-red-500'
                      : selectedAnswers[currentQuestionIndex] === option
                      ? 'bg-[#354554] text-white border-gray-800'
                      : 'hover:bg-[#CCD6E0] border-gray-800 bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={selectedAnswers[currentQuestionIndex] === option}
                    onChange={() => handleOptionSelect(currentQuestionIndex, option)}
                    disabled={submitted}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-semibold mr-2">{option.toUpperCase()}:</span>
                    <span>{questions[currentQuestionIndex][`option_${option}` as keyof Question]}</span>
                  </div>
                </label>
              ))}
            </div>
            
            {submitted && showCorrectAnswers && selectedAnswers[currentQuestionIndex] !== questions[currentQuestionIndex].answer && (
              <div className="mt-4 p-3 text-green-700 font-medium bg-green-50 rounded border-2 border-green-500">
                <CheckCircle className="inline-block w-5 h-5 mr-2" />
                Correct answer: <span className="font-bold">{questions[currentQuestionIndex].answer.toUpperCase()}</span>
              </div>
            )}
          </motion.div>
        ) : (
          // Review mode - all questions
          <div className="space-y-8">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className={`p-5 rounded-lg border-2 ${
                submitted 
                  ? (question.answer === selectedAnswers[qIndex] 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500') 
                  : 'bg-[#E0E6ED] border-gray-800'
              }`}>
                <p className="font-semibold text-lg mb-3 text-[#2C3E50]">
                  {qIndex + 1}. {question.question}
                </p>
                
                <div className="space-y-2">
                  {['a', 'b', 'c', 'd'].map((option) => (
                    <div 
                      key={option}
                      className={`flex items-start p-3 rounded-md border ${
                        submitted && showCorrectAnswers && question.answer === option
                          ? 'bg-green-100 border-green-500'
                          : submitted && selectedAnswers[qIndex] === option && question.answer !== option
                          ? 'bg-red-100 border-red-500'
                          : selectedAnswers[qIndex] === option
                          ? 'bg-[#354554] text-white border-gray-800'
                          : 'bg-white border-gray-800'
                      }`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center mr-3">
                        {selectedAnswers[qIndex] === option && (
                          <div className={`w-4 h-4 rounded-full ${
                            submitted && question.answer !== option ? 'bg-red-500' : 'bg-[#2C3E50]'
                          }`}></div>
                        )}
                        {submitted && showCorrectAnswers && question.answer === option && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium mr-2">{option.toUpperCase()}:</span>
                        <span>{question[`option_${option}` as keyof Question]}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {submitted && showCorrectAnswers && selectedAnswers[qIndex] !== question.answer && (
                  <p className="mt-3 p-2 text-green-700 font-medium bg-green-50 rounded border border-green-500">
                    <CheckCircle className="inline-block w-5 h-5 mr-1" />
                    Correct answer: {question.answer.toUpperCase()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex justify-between">
          {!submitted ? (
            <>
              <button
                type="button"
                onClick={toggleReviewMode}
                className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-[#2C3E50] bg-[#E0E6ED] hover:bg-[#CCD6E0] transition border-2 border-gray-800"
              >
                {reviewMode ? 'Return to Questions' : 'Review All Questions'}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#354554] hover:bg-[#4f5862] transition border-2 border-gray-800"
              >
                Submit Test
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="ml-auto inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#354554] hover:bg-[#4f5862] transition border-2 border-gray-800"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Dashboard
            </button>
          )}
        </div>
      </form>
    </div>
  );
}