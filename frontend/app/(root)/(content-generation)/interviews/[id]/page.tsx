'use client'

import Vapi from "@vapi-ai/web";
import { useState, useEffect, useContext, useRef } from "react";
import { PhoneIncoming, PhoneOff, Wifi, Mic, MicOff, ArrowLeft, User, Clock, Activity, Headphones, FileText, Check, X } from "lucide-react"; 
import Link from "next/link";
import AuthContext from "@/app/context/AuthContext";
import { useParams } from 'next/navigation';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");
console.log("Vapi initialized with public key:", process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
console.log("interview asker id:", process.env.NEXT_PUBLIC_VAPI_INTERVIEW_ASKER_ID);

export default function InterviewPage() {
    const params = useParams();
    const id = params.id as string;
    const [interview, setInterview] = useState<any>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false); 
    const [callDuration, setCallDuration] = useState(0);
    const { user, authTokens } = useContext(AuthContext) || {};
    const hasSetupListeners = useRef(false);

    // Fetch interview details
    useEffect(() => {
        const fetchInterviewDetails = async () => {
            setLoading(true);
            try {
                if (!authTokens?.access_token) {
                    throw new Error("Authentication required");
                }
                
                const response = await fetch(`http://localhost:8000/interviews/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${authTokens.access_token}`,
                        "Content-Type": "application/json",
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Failed to fetch interview details");
                }
                
                const data = await response.json();
                setInterview(data);
                
                // Parse questions from the interview data
                let parsedQuestions: string[] = [];
                try {
                    if (typeof data.questions === 'string') {
                        // Handle different formats that might be stored in the questions field
                        if (data.questions.startsWith('[') && data.questions.includes('```json')) {
                            // Format: ["```json", "[\"question1\", \"question2\"]", "```"]
                            const jsonString = data.questions.split('```json')[1].split('```')[0].trim();
                            parsedQuestions = JSON.parse(JSON.parse(jsonString));
                        } else if (data.questions.startsWith('[')) {
                            // Direct JSON array format
                            parsedQuestions = JSON.parse(data.questions);
                        } else {
                            // Single string or other format
                            parsedQuestions = [data.questions];
                        }
                    }
                } catch (parseErr) {
                    console.error("Error parsing questions:", parseErr);
                    parsedQuestions = [String(data.questions)];
                }
                
                setQuestions(parsedQuestions);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching interview details:", error);
                setError(error instanceof Error ? error.message : "An unknown error occurred");
                setLoading(false);
            }
        };

        fetchInterviewDetails();
    }, [id, authTokens]);

    // Setup Vapi event listeners
    useEffect(() => {
        if (hasSetupListeners.current) return;
        
        const handleCallStart = () => {
            console.log("Vapi interview call started.");
            setIsCallActive(true);
            setIsConnecting(false);
            setError(null);
            setCallDuration(0);
        };

        const handleCallEnd = () => {
            console.log("Vapi interview call ended.");
            setIsCallActive(false);
            setIsConnecting(false);
            setError(null);
        };

        const handleError = (e: any) => {
            console.error("Vapi error:", e);
            setError(`An error occurred: ${e.message || e.errorMsg || String(e)}`);
            setIsCallActive(false);
            setIsConnecting(false);
        };

        const handleConnected = () => {
            console.log("Vapi connection established.");
            setIsConnecting(false);
        };

        const handleMessage = (message: any) => {
            console.log("Message received:", message);
        };

        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("error", handleError);
        vapi.on("message", handleMessage);
        if (typeof vapi.on === 'function' && vapi.on.toString().includes('connected')) {
            vapi.on("speech-start", handleConnected);
        }
        
        hasSetupListeners.current = true;

        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("error", handleError);
            vapi.off("message", handleMessage);
            if (typeof vapi.off === 'function' && vapi.off.toString().includes('connected')) {
                vapi.off("speech-start", handleConnected);
            }
        };
    }, []);

    // Track call duration
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        
        if (isCallActive) {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else if (!isCallActive && callDuration > 0) {
            setCallDuration(0);
        }
        
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isCallActive, callDuration]);

    // Connection timeout handler
    useEffect(() => {
        let connectionTimeout: NodeJS.Timeout | undefined;
        
        if (isConnecting) {
            connectionTimeout = setTimeout(() => {
                if (isConnecting) {
                    console.log("Connection state timeout reached - resetting connecting state");
                    setIsConnecting(false);
                    setError("Connection attempt timed out. Please try again.");
                }
            }, 10000);
        }
        
        return () => {
            if (connectionTimeout) clearTimeout(connectionTimeout);
        };
    }, [isConnecting]);

    const startInterview = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            // Format questions for Vapi
            const formattedQuestions = JSON.stringify(questions);
            console.log("Starting interview with questions:", formattedQuestions);
            
            // Set up a timeout for the initial connection attempt
            const connectionPromise = vapi.start(process.env.NEXT_PUBLIC_VAPI_INTERVIEW_ASKER_ID || "", {
                variableValues: {
                    questions: formattedQuestions,
                }
            });
            
            // Race the promise against a timeout
            const result = await Promise.race([
                connectionPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Connection taking too long")), 15000)
                )
            ]);
            
            console.log("Vapi interview call initiated successfully:", result);
        } catch (err) {
            console.error("Error starting Vapi interview call:", err);
            setError("Failed to start the interview. Please try again.");
            setIsCallActive(false);
            setIsConnecting(false);
        }
    };

    const endInterview = () => {
        try {
            setIsConnecting(true);
            vapi.stop();
        } catch (err) {
            console.error("Error stopping Vapi call:", err);
            setError("Failed to stop the interview properly.");
            setIsConnecting(false);
            setIsCallActive(false);
        }
    };

    // Format time for display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Button text based on state
    const getButtonText = () => {
        if (isConnecting && !isCallActive) return "Connecting...";
        if (isConnecting && isCallActive) return "Hanging up...";
        if (isCallActive) return "End Interview";
        return "Start Practice Interview";
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center items-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-200 mb-4"></div>
                    <div className="text-lg text-gray-600">Loading interview details...</div>
                </div>
            </div>
        );
    }

    if (error && !interview) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Interview</h2>
                    <p className="text-red-600">{error}</p>
                    <Link
                        href="/profile"
                        className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

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
                    {interview?.role || "Interview"} Practice Session
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                        <User className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>{user?.username || "Guest"}</span>
                    </div>
                    {isCallActive && (
                        <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                            <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                            <span>Duration: {formatTime(callDuration)}</span>
                        </div>
                    )}
                    <div className="flex items-center rounded-full bg-white px-3 py-1 shadow-sm">
                        <Activity className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>Interview #{id}</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Main Content Area */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center">
                                <FileText className="h-5 w-5 text-indigo-500 mr-3" />
                                <h2 className="text-lg font-semibold text-gray-800">Interview Questions</h2>
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
                            {/* Questions */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">
                                    Your Interview Questions:
                                </h3>
                                <ul className="space-y-4">
                                    {questions.map((question, index) => (
                                        <li key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <div className="flex">
                                                <div className="min-w-8 mr-3">
                                                    <span className="bg-indigo-100 text-indigo-800 font-medium px-2 py-1 rounded-full text-sm">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div className="text-gray-700">{question}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Call controls */}
                            <div className="flex flex-col items-center mt-8">
                                {/* AI Avatar / Status Indicator */}
                                {isCallActive ? (
                                    <div className="mb-6 flex flex-col items-center">
                                        <div className="relative flex items-center justify-center w-32 h-32">
                                            {/* Pulsing background */}
                                            <div className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping"></div>
                                            {/* Static foreground circle with icon */}
                                            <div className="relative inline-flex rounded-full h-28 w-28 bg-indigo-500 items-center justify-center shadow-lg">
                                                <Wifi className="w-12 h-12 text-white" />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-col items-center">
                                            <p className="text-sm font-medium text-indigo-600">AI Interviewer Connected</p>
                                            <p className="text-xs text-gray-500 mt-1">Speaking with AI Interviewer</p>
                                        </div>
                                    </div>
                                ) : isConnecting ? (
                                    <div className="mb-6 flex flex-col items-center">
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
                                    <div className="mb-6 flex flex-col items-center">
                                        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
                                            <Mic className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-gray-500">Ready to start interview</p>
                                    </div>
                                )}
                                
                                {/* Call Status */}
                                <p className="text-lg text-gray-700 mb-6 text-center max-w-xl">
                                    {isCallActive
                                        ? "Your interview is in progress. Speak clearly and take your time answering questions."
                                        : isConnecting
                                        ? "Connecting to your AI interviewer. This may take a few moments..."
                                        : "Start the practice interview when you're ready. The AI interviewer will ask you the questions listed above."}
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
                                            onClick={startInterview}
                                            disabled={isConnecting || questions.length === 0}
                                            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <PhoneIncoming className="w-5 h-5 mr-2" />
                                            {getButtonText()}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={endInterview}
                                            disabled={isConnecting}
                                            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <PhoneOff className="w-5 h-5 mr-2" />
                                            {getButtonText()}
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
                            <User className="h-5 w-5 text-indigo-500 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-800">Interview Details</h2>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                                <p className="text-gray-800 font-medium">{interview?.role || "Not specified"}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Level</h3>
                                <p className="text-gray-800 font-medium">{interview?.level || "Not specified"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Tech Stack</h3>
                                <p className="text-gray-800 font-medium">{interview?.techstack || "Not specified"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Interview Type</h3>
                                <p className="text-gray-800 font-medium">{interview?.type || "Not specified"}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Created On</h3>
                                <p className="text-gray-800 font-medium">
                                    {interview?.created_at ? new Date(interview.created_at).toLocaleDateString() : "Unknown"}
                                </p>
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
                        
                        {/* Interview Tips */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-2">Interview Tips</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                        <Check className="h-3 w-3 text-indigo-600" />
                                    </div>
                                    <span className="ml-2">Take your time to think before answering</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                        <Check className="h-3 w-3 text-indigo-600" />
                                    </div>
                                    <span className="ml-2">Use specific examples from your experience</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                        <Check className="h-3 w-3 text-indigo-600" />
                                    </div>
                                    <span className="ml-2">Structure your answers clearly</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                        <Check className="h-3 w-3 text-indigo-600" />
                                    </div>
                                    <span className="ml-2">Speak clearly and at a moderate pace</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

