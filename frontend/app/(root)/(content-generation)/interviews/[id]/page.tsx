'use client';

import Vapi from "@vapi-ai/web";
import { useState, useEffect, useContext, useRef } from "react";
import { PhoneIncoming, PhoneOff, Wifi, Mic, MicOff, ArrowLeft, User, Clock, Activity, Headphones, FileText } from "lucide-react";
import AuthContext from "@/app/context/AuthContext";
import Link from "next/link";
import { useParams } from "next/navigation";

// Initialize vapi outside component to avoid recreation on re-renders
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

interface Interview {
    id: number;
    questions: string;
    role: string;
    techstack: string;
    amount: number;
    level: string;
    type: string;
    created_at: string;
}

export default function InterviewPage() {
    const [interview, setInterview] = useState<Interview>();
    const [isLoading, setIsLoading] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const { user, authTokens } = useContext(AuthContext) || {};
    const hasSetupListeners = useRef(false);
    const params = useParams();
    const interviewId = params.id;

    // Fetch interview data based on ID
    useEffect(() => {
        async function fetchInterview() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/interviews/${interviewId}`, {
                    headers: {
                        'Authorization': `Bearer ${authTokens?.access_token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error fetching interview: ${response.status}`);
                }

                const data = await response.json();
                setInterview(data);
            } catch (err) {
                console.error("Error fetching interview:", err);
                setError("Failed to load interview data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        if (authTokens?.access_token && interviewId) {
            fetchInterview();
        }
    }, [interviewId, authTokens]);

    // Setup event listeners only once
    useEffect(() => {
        if (hasSetupListeners.current) return;
        
        const handleCallStart = () => {
            console.log("Vapi call started.");
            setIsCallActive(true);
            setIsConnecting(false);
            setError(null);
            setCallDuration(0);
        };

        const handleCallEnd = () => {
            console.log("Vapi call ended.");
            setIsCallActive(false);
            setIsConnecting(false);
            setError(null);
        };

        interface VapiErrorEvent {
            message?: string;
        }

        const handleError = (e: VapiErrorEvent | string) => {
            console.error("Vapi error:", e);
            setError(`An error occurred: ${typeof e === 'object' ? e.message : e}`);
            setIsCallActive(false);
            setIsConnecting(false);
        };

        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("error", handleError);
        
        hasSetupListeners.current = true;

        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("error", handleError);
        };
    }, []);

    // Parse questions from interview data
    const getInterviewQuestions = () => {
        if (!interview?.questions) return [];
        try {
            return JSON.parse(interview.questions);
        } catch (e) {
            console.error("Error parsing questions:", e);
            return [];
        }
    };
    
    // Parse techstack from interview data
    const getTechStack = () => {
        if (!interview?.techstack) return "";
        try {
            return JSON.parse(interview.techstack);
        } catch (e) {
            // If parsing fails, it might be a string already
            return interview.techstack.replace(/^"|"$/g, '');
        }
    };

    const startCall = async () => {
        setIsConnecting(true);
        setError(null);
        
        const questions = getInterviewQuestions();
        if (questions.length === 0) {
            setError("No interview questions found. Cannot start the interview.");
            setIsConnecting(false);
            return;
        }
        
        try {
            const assistantId = process.env.NEXT_PUBLIC_VAPI_INTERVIEW_ASSISTANT_ID || "";
            console.log("Starting call with assistant ID:", assistantId);
            
            await vapi.start(assistantId, {
                variableValues: {
                    username: user?.username || "User",
                    role: interview?.role || "Candidate",
                    level: interview?.level || "Intermediate",
                    techstack: getTechStack() || "General",
                    questions: JSON.stringify(questions),
                    authToken: authTokens?.access_token || "",
                }
            });
        } catch (err) {
            console.error("Error starting Vapi call:", err);
            setError("Failed to start the call. Please try again.");
            setIsConnecting(false);
        }
    };

    const endCall = async () => {
        try {
            setIsConnecting(true);
            await vapi.stop();
        } catch (err) {
            console.error("Error stopping Vapi call:", err);
            setError("Failed to stop the call properly.");
            setIsConnecting(false);
            setIsCallActive(false);
        }
    };

    // Track the call duration
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        
        if (isCallActive) {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else if (!isCallActive && callDuration > 0) {
            // Reset duration when call ends
            setCallDuration(0);
        }
        
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isCallActive, callDuration]);

    // Format time for display
    const formatTime = (seconds: number): string => {
        const mins: number = Math.floor(seconds / 60);
        const secs: number = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Format date for display
    // Format date for display
    const formatDate = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-gray-600">Loading interview data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !interview) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
                    <div className="flex flex-col items-center">
                        <svg className="h-10 w-10 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold mb-2">Error Loading Interview</h2>
                        <p className="mb-4">{error}</p>
                        <Link
                            href="/profile"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const questions = getInterviewQuestions();

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
            {/* Hero section with gradient background */}
            <div className="relative rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-8 shadow-sm border border-gray-100">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                    <Headphones className="w-full h-full text-indigo-600" />
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
                    {interview?.role || "Role"} - {interview?.level || "Level"} Interview
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                        <User className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>{user?.username || "Guest"}</span>
                    </div>
                    <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                        <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>Created: {formatDate(interview?.created_at)}</span>
                    </div>
                    {isCallActive && (
                        <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                            <Activity className="h-4 w-4 mr-2 text-indigo-500" />
                            <span>Duration: {formatTime(callDuration)}</span>
                        </div>
                    )}
                    <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                        <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>ID: {interview?.id || ""}</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Main Content Area */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center">
                                <Headphones className="h-5 w-5 text-indigo-500 mr-3" />
                                <h2 className="text-lg font-semibold text-gray-800">Interview Session</h2>
                            </div>
                            {isCallActive && (
                                <div className="flex items-center text-sm text-gray-600 animate-pulse">
                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                    Live
                                </div>
                            )}
                            {isConnecting && !isCallActive && (
                                <div className="flex items-center text-sm text-gray-600 animate-pulse">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                                    Connecting
                                </div>
                            )}
                        </div>
                        
                        <div className="px-5 py-4 bg-white">
                            <div className="flex flex-col items-center justify-center py-8">
                                {/* AI Avatar / Status Indicator */}
                                {isCallActive ? (
                                    <div className="mb-8 flex flex-col items-center">
                                        <div className="relative flex items-center justify-center w-32 h-32">
                                            {/* Pulsing background */}
                                            <div className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping"></div>
                                            {/* Static foreground circle with icon */}
                                            <div className="relative inline-flex rounded-full h-28 w-28 bg-indigo-500 items-center justify-center shadow-lg">
                                                <Wifi className="w-12 h-12 text-white" />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-col items-center">
                                            <p className="text-sm font-medium text-indigo-600">AI Assistant Connected</p>
                                            <p className="text-xs text-gray-500 mt-1">Speaking with AI Interviewer</p>
                                        </div>
                                    </div>
                                ) : isConnecting ? (
                                    <div className="mb-8 flex flex-col items-center">
                                        <div className="relative flex items-center justify-center w-32 h-32">
                                            {/* Pulsing background */}
                                            <div className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping"></div>
                                            {/* Static foreground circle with icon */}
                                            <div className="relative inline-flex rounded-full h-28 w-28 bg-yellow-500 items-center justify-center shadow-lg">
                                                <Wifi className="w-12 h-12 text-white animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-col items-center">
                                            <p className="text-sm font-medium text-yellow-600">Establishing Connection</p>
                                            <p className="text-xs text-gray-500 mt-1">Please wait...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-8 flex flex-col items-center">
                                        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
                                            <Mic className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-gray-500">Ready to start interview</p>
                                    </div>
                                )}
                                
                                {/* Call Status */}
                                <p className="text-lg text-gray-700 mb-6 text-center max-w-xl">
                                    {isCallActive
                                        ? "Your interview call is in progress. Speak clearly and take your time answering questions."
                                        : isConnecting
                                        ? "Connecting to your AI interviewer. This may take a few moments..."
                                        : "Start the call when you are ready to begin your mock interview. You'll be connected with our AI interviewer."}
                                </p>
                                
                                {/* Error Display */}
                                {error && (
                                    <div className="mb-6 w-full max-w-lg text-center">
                                        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                            <p className="flex items-center justify-center">
                                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Call Controls */}
                                <div className="mt-2">
                                    {!isCallActive ? (
                                        <button
                                            onClick={startCall}
                                            disabled={isConnecting}
                                            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <PhoneIncoming className="w-5 h-5 mr-2" />
                                            {isConnecting ? (
                                                <>
                                                    <span>Connecting</span>
                                                    <span className="inline-flex ml-2">
                                                        <span className="animate-bounce">.</span>
                                                        <span className="animate-bounce delay-150">.</span>
                                                        <span className="animate-bounce delay-300">.</span>
                                                    </span>
                                                </>
                                            ) : "Start Interview"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={endCall}
                                            disabled={isConnecting}
                                            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <PhoneOff className="w-5 h-5 mr-2" />
                                            {isConnecting ? "Ending..." : "End Interview"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Sidebar with Interview Information */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100 sticky top-4">
                        <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50 flex items-center">
                            <FileText className="h-5 w-5 text-indigo-500 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-800">Interview Details</h2>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                                <p className="text-gray-800 font-medium">{interview?.role || "Not specified"}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Level</h3>
                                <p className="text-gray-800 font-medium capitalize">{interview?.level || "Not specified"}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Interview Type</h3>
                                <p className="text-gray-800 font-medium capitalize">{interview?.type || "Not specified"}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Tech Stack</h3>
                                <p className="text-gray-800 font-medium">{getTechStack() || "Not specified"}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                                <p className="text-gray-800 font-medium">{formatDate(interview?.created_at)}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                                <div className="flex items-center">
                                    {isCallActive ? (
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                            Active
                                        </div>
                                    ) : isConnecting ? (
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                                            Connecting
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <div className="h-2 w-2 rounded-full bg-gray-500 mr-2"></div>
                                            Ready
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Questions Preview */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-2">Interview Questions ({questions.length})</h3>
                            <ul className="space-y-3 text-sm">
                                {questions.map((question: string, index: number) => (
                                    <li key={index} className="bg-white p-2 rounded border border-gray-200">
                                        <div className="flex items-start">
                                            <div className="bg-indigo-100 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                                {index + 1}
                                            </div>
                                            <span className="text-gray-700 line-clamp-2">{question}</span>
                                        </div>
                                    </li>
                                ))}
                                {questions.length === 0 && (
                                    <li className="text-gray-500 italic">No questions available</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}