'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  BookOpen,
  FileText,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

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

  const getScoreColorClass = (scoreValue: number) => {
    if (scoreValue >= 80) return "text-green-600";
    if (scoreValue >= 60) return "text-indigo-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      {/* Hero section with gradient background */}
      <div className="relative rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-8 shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <FileText className="w-full h-full text-indigo-600" />
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
        <h1 className="text-3xl font-bold mb-3 text-gray-800 leading-tight">
          Assessment #{testId}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {!submitted && !reviewMode && (
            <div className={`flex items-center rounded-full bg-white px-3 py-1 shadow-sm ${
              timeRemaining < 60 ? 'text-red-600 animate-pulse' : ''
            }`}>
              <Clock className="h-4 w-4 mr-2 text-indigo-500" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
          <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
            <Target className="h-4 w-4 mr-2 text-indigo-500" />
            <span>{questions.length} Questions</span>
          </div>
        </div>
      </div>

      {/* Results panel */}
      {submitted && score !== null && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white shadow-md rounded-lg overflow-hidden border border-gray-100"
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center bg-white">
            <Award className="h-5 w-5 text-indigo-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-800">Assessment Results</h2>
          </div>
          <div className="px-5 py-4 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-800">Score:</span>
                  <span className={`text-xl font-bold ${getScoreColorClass(score)}`}>
                    {score.toFixed(1)}%
                  </span>
                </div>
                <p className="text-gray-600">
                  {Math.round(score * questions.length / 100)} out of {questions.length} questions correct
                </p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <button 
                  onClick={toggleShowAnswers}
                  className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {showCorrectAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
                <button
                  onClick={toggleReviewMode}
                  className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {reviewMode ? 'Exit Review' : 'Review All'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Question navigator (only in review mode or after submission) */}
      {(reviewMode || submitted) && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 mb-8">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center bg-white">
            <Target className="h-5 w-5 text-indigo-500 mr-3" />
            <h2 className="text-lg font-semibold text-gray-800">Question Navigator</h2>
          </div>
          <div className="px-5 py-4 bg-white">
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <button
                  key={`nav-${index}`}
                  onClick={() => navigateToQuestion(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border transition-all
                    ${currentQuestionIndex === index ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                    ${!submitted ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' :
                      selectedAnswers[index] === questions[index].answer 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : selectedAnswers[index] 
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                <span>Incorrect</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-4">
          <form>
            {/* Single question view when not in review mode */}
            {!reviewMode ? (
              <motion.div 
                key={`question-${currentQuestionIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100"
              >
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-indigo-500 mr-3" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                  </div>
                  {!submitted && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                        className="inline-flex items-center p-2 text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="w-5 h-5 mr-1" /> Previous
                      </button>
                      <button
                        type="button"
                        disabled={currentQuestionIndex === questions.length - 1}
                        onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                        className="inline-flex items-center p-2 text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        Next <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="px-5 py-4 bg-white">
                  <p className="text-xl mb-6 text-gray-800 leading-relaxed">
                    {questions[currentQuestionIndex].question}
                  </p>
                  
                  <div className="space-y-3">
                    {['a', 'b', 'c', 'd'].map((option) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === option;
                      const isCorrect = questions[currentQuestionIndex].answer === option;
                      const isIncorrect = submitted && isSelected && !isCorrect;
                      
                      return (
                        <label 
                          key={option}
                          className={`flex items-start p-4 rounded-md border cursor-pointer transition-all 
                            ${submitted && showCorrectAnswers && isCorrect
                              ? 'bg-green-50 border-green-300 ring-1 ring-green-300'
                              : isIncorrect
                              ? 'bg-red-50 border-red-300 ring-1 ring-red-300'
                              : isSelected
                              ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300'
                              : 'hover:bg-gray-50 border-gray-200'
                            }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(currentQuestionIndex, option)}
                            disabled={submitted}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <span className="font-semibold mr-2 text-gray-800">{option.toUpperCase()}:</span>
                            <span className="text-gray-700">{questions[currentQuestionIndex][`option_${option}` as keyof Question]}</span>
                          </div>
                          {submitted && showCorrectAnswers && isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                  
                  {submitted && showCorrectAnswers && selectedAnswers[currentQuestionIndex] !== questions[currentQuestionIndex].answer && (
                    <div className="mt-4 p-4 text-green-700 bg-green-50 rounded-md border border-green-200 flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Correct answer:</p>
                        <p className="font-bold">{questions[currentQuestionIndex].answer.toUpperCase()}: {questions[currentQuestionIndex][`option_${questions[currentQuestionIndex].answer}` as keyof Question]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              // Review mode - all questions
              <div className="space-y-8">
                {questions.map((question, qIndex) => {
                  const isAnswered = !!selectedAnswers[qIndex];
                  const isCorrect = submitted && question.answer === selectedAnswers[qIndex];
                  const isIncorrect = submitted && isAnswered && !isCorrect;
                  
                  return (
                    <div key={qIndex} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                      <div className={`px-5 py-4 border-b flex justify-between items-center
                        ${isCorrect ? 'bg-green-50 border-green-100' : isIncorrect ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}
                      >
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          <span className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold mr-3 shadow-sm">
                            {qIndex + 1}
                          </span>
                          Question {qIndex + 1}
                        </h3>
                        {submitted && (
                          <div>
                            {isCorrect ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Correct
                              </span>
                            ) : isIncorrect ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                Incorrect
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Not Answered
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="px-5 py-4">
                        <p className="text-lg mb-5 text-gray-800 leading-relaxed">
                          {question.question}
                        </p>
                        
                        <div className="space-y-3">
                          {['a', 'b', 'c', 'd'].map((option) => {
                            const isSelected = selectedAnswers[qIndex] === option;
                            const isCorrect = question.answer === option;
                            const isIncorrect = submitted && isSelected && !isCorrect;
                            
                            return (
                              <div 
                                key={`${qIndex}-${option}`}
                                className={`flex items-start p-4 rounded-md border
                                  ${submitted && showCorrectAnswers && isCorrect
                                    ? 'bg-green-50 border-green-300'
                                    : isIncorrect
                                    ? 'bg-red-50 border-red-300'
                                    : isSelected
                                    ? 'bg-indigo-50 border-indigo-300'
                                    : 'bg-white border-gray-200'
                                  }`}
                              >
                                <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                                  {isSelected && (
                                    <div className={`w-4 h-4 rounded-full ${
                                      submitted && !isCorrect ? 'bg-red-500' : 'bg-indigo-500'
                                    }`}></div>
                                  )}
                                  {submitted && showCorrectAnswers && isCorrect && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium mr-2 text-gray-800">{option.toUpperCase()}:</span>
                                  <span className="text-gray-700">{question[`option_${option}` as keyof Question]}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {submitted && showCorrectAnswers && selectedAnswers[qIndex] !== question.answer && (
                          <div className="mt-4 p-4 text-green-700 bg-green-50 rounded-md border border-green-200 flex items-start">
                            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Correct answer:</p>
                              <p className="font-bold">{question.answer.toUpperCase()}: {question[`option_${question.answer}` as keyof Question]}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </form>
        </div>
        
        {/* Sidebar with test info and controls */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 sticky top-4">
            <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50 flex items-center">
              <Target className="h-5 w-5 text-indigo-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">Assessment Info</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Test ID</h3>
                <p className="text-gray-800 font-medium">#{testId}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Questions</h3>
                <div className="flex items-center">
                  <span className="text-gray-800 font-medium">{questions.length} total</span>
                </div>
              </div>
              
              {!submitted && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Time Remaining</h3>
                  <div className={`flex items-center font-mono ${
                    timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-gray-800'
                  }`}>
                    <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                    <span className="font-medium">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
              )}
              
              {submitted && score !== null && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Your Score</h3>
                  <div className="flex items-center">
                    <div className={`text-lg font-bold ${getScoreColorClass(score)}`}>
                      {score.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
              
              {submitted && score !== null && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Questions Correct</h3>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-medium">
                      {Math.round(score * questions.length / 100)} of {questions.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              {!submitted ? (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center justify-center w-full px-4 py-2 border border-indigo-500 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Assessment
                  </button>
                  <button
                    type="button"
                    onClick={toggleReviewMode}
                    className="flex items-center justify-center w-full px-4 py-2 mt-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {reviewMode ? 'Exit Review' : 'Review All Questions'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-full px-4 py-2 border border-indigo-500 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Return to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={toggleReviewMode}
                    className="flex items-center justify-center w-full px-4 py-2 mt-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {reviewMode ? 'Exit Review' : 'Review All Questions'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}