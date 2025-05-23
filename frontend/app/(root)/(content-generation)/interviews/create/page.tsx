'use client'; 

import Vapi from "@vapi-ai/web";
import { useState, useEffect, useContext, useRef } from "react";
import { PhoneIncoming, PhoneOff, Wifi, Mic, MicOff, ArrowLeft, User, Clock, Activity, Headphones } from "lucide-react"; 
import AuthContext from "@/app/context/AuthContext";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Import useRouter

// Initialize vapi outside component to avoid recreation on re-renders
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

export default function InterviewPage({ params }: { params: { id: string } }) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const { user, authTokens } = useContext(AuthContext) || {}; 
    const hasSetupListeners = useRef(false);
    const [apiEndpointCalledInSession, setApiEndpointCalledInSession] = useState(false); // New state
    const router = useRouter(); // Initialize router

    const assistantId = process.env.NEXT_PUBLIC_VAPI_INTERVIEW_ASSISTANT_ID || "";

    // Function to fetch interviews and redirect
    const fetchInterviewsAndRedirect = async () => {
        if (!authTokens?.access_token) {
            console.error("No auth token available to fetch interviews.");
            setError("Authentication error. Cannot fetch interview data.");
            return;
        }

        try {
            console.log("Fetching interviews from localhost:8000/interviews...");
            const response = await fetch("http://localhost:8000/interviews", {
                headers: {
                    "Authorization": `Bearer ${authTokens.access_token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Failed to fetch interviews:", response.status, errorData);
                setError(`Failed to fetch interview data: ${response.statusText}`);
                return;
            }

            const interviews = await response.json();

            if (!Array.isArray(interviews) || interviews.length === 0) {
                console.log("No interviews found or invalid format.");
                // Optionally, set an error or a message if no interviews are found
                // setError("No interviews found to redirect to.");
                return;
            }

            // Find the latest interview by created_at
            // Ensure created_at is a valid date string for robust sorting
            const latestInterview = interviews.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA; // Sort descending
            })[0];

            if (latestInterview && latestInterview.id) {
                console.log("Latest interview found:", latestInterview);
                router.push(`/interviews/${latestInterview.id}`);
            } else {
                console.log("Could not determine the latest interview or ID is missing.");
                // Optionally, set an error
                // setError("Could not determine the latest interview to redirect.");
            }

        } catch (err) {
            console.error("Error in fetchInterviewsAndRedirect:", err);
            setError("An error occurred while processing interview data.");
        }
    };

    // Setup event listeners only once
    useEffect(() => {
        if (hasSetupListeners.current) return;
        
        const handleCallStart = () => {
            console.log("Vapi call started.");
            setIsCallActive(true);
            setIsConnecting(false); // Explicitly set connecting to false when call starts
            setError(null);
            setCallDuration(0);
            setApiEndpointCalledInSession(false); // Reset flag for the new session
        };

        const handleCallEnd = async () => { // Make handleCallEnd async
            console.log("Vapi call ended (via call-end event).");
            setIsCallActive(false);
            setIsConnecting(false); // Ensure connecting is false when call ends
            setError(null); // Clear any error if call ends cleanly

            if (apiEndpointCalledInSession) {
                console.log("API endpoint was called in this session and call has ended. Fetching interviews.");
                await fetchInterviewsAndRedirect(); // Await the async function
                setApiEndpointCalledInSession(false); // Reset flag after processing
            }
        };

        const handleError = async (e: any) => { // Make handleError async
            console.error("Vapi error:", e); // Log the full error object

            const isMeetingEffectivelyOverByError = e?.errorMsg === "Meeting has ended" || e?.error?.type === "ejected";

            if (!isMeetingEffectivelyOverByError) {
                // Only set a generic error if it's not the "Meeting has ended" type
                setError(`An error occurred: ${e.message || e.errorMsg || String(e)}`);
            }
            // If it's "Meeting has ended", we expect fetchInterviewsAndRedirect to handle navigation or its own errors.

            setIsCallActive(false);
            setIsConnecting(false);

            if (isMeetingEffectivelyOverByError && apiEndpointCalledInSession) {
                console.log("API endpoint was called and meeting ended (via error event: " + (e.errorMsg || e.message || "Unknown") + "). Fetching interviews.");
                await fetchInterviewsAndRedirect(); // This function handles its own errors
                setApiEndpointCalledInSession(false); // Reset flag
            }
        };

        // Add a connection established handler
        const handleConnected = () => {
            console.log("Vapi connection established.");
            setIsConnecting(false); // Clear connecting state immediately when connected
        };

        const handleMessage = async (message: any) => { // Make handleMessage async
            if (message.type === "workflow.node.started" && message.node?.type === "apiRequest") {
                console.log("successfully called api endpoint (workflow.node.started), fetching interviews and redirecting.");
                // Set the flag, though redirection will be attempted immediately
                setApiEndpointCalledInSession(true); 
                await fetchInterviewsAndRedirect(); // Call redirect immediately
            }
            // Example structure: { type: "function-call", ... }, { type: "tool-calls", ... }, etc.
            if (message.type === "function-call") {
                // The assistant made a function call
                console.log("Function call detected:", message);
            }
            if (message.type === "tool-calls") {
                // The assistant used a tool (such as calling an endpoint)
                console.log("Tool call detected:", message);
                 // You might want to check here too if this is the specific API call you're interested in
                // For example, if message.tool_calls.some(toolCall => toolCall.function?.name === "your_api_endpoint_tool_name")) {
                //    // If you also want to redirect on other types of tool calls indicating API success:
                //    setApiEndpointCalledInSession(true); 
                //    await fetchInterviewsAndRedirect();
                // }
            }
            // You can add more conditions here for other message types if needed
            console.log("Generic message received:", message);
        };


        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("error", handleError);
        vapi.on("message", handleMessage); 
        // Listen for connection established event if available in Vapi
        if (typeof vapi.on === 'function' && vapi.on.toString().includes('connected')) {
            vapi.on("speech-start", handleConnected); // Assuming 'speech-start' implies connected for your Vapi version
        }
        
        hasSetupListeners.current = true;

        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("error", handleError);
            vapi.off("message", handleMessage);
            // Remove connection established handler if it was added
            if (typeof vapi.off === 'function' && vapi.off.toString().includes('connected')) {
                vapi.off("speech-start", handleConnected); // Use the same event name for off
            }
        };
    }, [authTokens, router, apiEndpointCalledInSession]); // Add dependencies used in handlers or fetch function if they are not stable

    // Add a timeout to clear the connecting state if events don't fire
    useEffect(() => {
        let connectionTimeout: NodeJS.Timeout | undefined;
        
        if (isConnecting) {
            // Set a timeout to automatically clear connecting state after a reasonable period
            connectionTimeout = setTimeout(() => {
                if (isConnecting) {
                    console.log("Connection state timeout reached - resetting connecting state");
                    setIsConnecting(false);
                }
            }, 10000); // 10 seconds timeout
        }
        
        return () => {
            if (connectionTimeout) clearTimeout(connectionTimeout);
        };
    }, [isConnecting]);

    const startCall = async () => {
        setIsConnecting(true);
        setError(null);
        setApiEndpointCalledInSession(false); // Reset before starting a new call attempt
        try {
            console.log("Starting call with assistant ID:", assistantId);
            
            // Set up a timeout for the initial connection attempt
            const connectionPromise = vapi.start(assistantId, {
                variableValues: {
                    username: user?.username || "User",
                    authToken: authTokens?.access_token || "", 
                }
            });
            
            // Race the promise against a timeout
            const result = await Promise.race([
                connectionPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Connection taking too long")), 15000)
                )
            ]);
            
            console.log("Vapi call initiated successfully:", result);
            
            // If we get here without error, assume the call will start soon via event
            // Keep isConnecting true, the event handlers will update it
        } catch (err) {
            console.error("Error starting Vapi call:", err);
            setError("Failed to start the call. Please try again.");
            setIsCallActive(false);
            setIsConnecting(false);
        }
    };

    const endCall = () => {
        try {
            setIsConnecting(true); 
            vapi.stop();
            // Note: We don't update state here - event listeners will handle that
            // The handleCallEnd event will trigger the fetchInterviewsAndRedirect if conditions are met
        } catch (err) {
            console.error("Error stopping Vapi call:", err);
            setError("Failed to stop the call properly.");
            setIsConnecting(false); // Fallback if event doesn't fire
            setIsCallActive(false); // Fallback
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
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Loading state message handling
    const getButtonText = () => {
        if (isConnecting && !isCallActive) return "Connecting...";
        if (isConnecting && isCallActive) return "Hanging up...";
        if (isCallActive) return "End Interview";
        return "Start Interview";
    };

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
                    Mock Interview Session
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
                        <span>Session ID: {params.id}</span>
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
                                            {getButtonText()}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={endCall}
                                            disabled={isConnecting && isCallActive} // Disable only if connecting to end
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
                            <h2 className="text-lg font-semibold text-gray-800">Interview Info</h2>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Session ID</h3>
                                <p className="text-gray-800 font-medium">#{params.id}</p>
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
                            
                            {isCallActive && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                                        <span className="text-gray-800 font-medium">{formatTime(callDuration)}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Participant</h3>
                                <div className="flex items-center">
                                    <span className="text-gray-800">{user?.username || "Guest"}</span>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Interviewer</h3>
                                <div className="flex items-center bg-indigo-50 p-2 rounded-md">
                                    <div className="rounded-full bg-indigo-100 p-2 mr-2">
                                        <Headphones className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <span className="text-gray-800">AI Assistant</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Tips Section */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                            <h3 className="font-medium text-gray-800 mb-2">Interview Tips</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                        <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="ml-2">Speak clearly and at a moderate pace</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                        <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="ml-2">Use concrete examples in your answers</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="rounded-full bg-indigo-100 p-1 mt-0.5 flex-shrink-0">
                                        <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="ml-2">Take a moment to think before answering</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}