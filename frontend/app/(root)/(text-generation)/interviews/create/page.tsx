'use client'; // Add this directive for client-side interactivity

import Vapi from "@vapi-ai/web";
import { useState, useEffect, useContext } from "react"; // Import useEffect
import { PhoneIncoming, PhoneOff, Wifi } from "lucide-react"; // Import Wifi icon
import AuthContext from "@/app/context/AuthContext";

// Initialize Vapi outside the component
// It's generally better to initialize Vapi once, perhaps in a context or higher-level component if used across pages.
// For simplicity here, we initialize it directly. Ensure the key is handled securely.
const vapi = new Vapi("14abf4ce-1be3-4181-85e9-be9cc5c88259");

export default function InterviewPage({ params }: { params: { id: string } }) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false); // State for loading/connecting
    const [error, setError] = useState<string | null>(null); // State for errors
    const { user, authTokens } = useContext(AuthContext) || {}; 

    const assistantId = "86906a67-56d5-45cc-8aaa-418370c85ad5";

    const startCall = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            await vapi.start(assistantId, {
                variableValues: {
                    username: user?.username || "User",
                    authToken: authTokens?.access_token || "", 
                }
            });

        } catch (err) {
            console.error("Error starting Vapi call:", err);
            setError("Failed to start the call. Please try again.");
            setIsCallActive(false);
            setIsConnecting(false); // Ensure connecting is false on error
        }
        // finally block removed as connecting state is handled by events now
    };

    const endCall = async () => {
        setIsConnecting(true); // Indicate processing
        setError(null);
        try {
            await vapi.stop();
            // State will be updated by 'call-end' event listener
        } catch (err) {
            console.error("Error stopping Vapi call:", err);
            setError("Failed to stop the call properly.");
            // Force state update if stop fails? Maybe not, rely on potential 'call-end' or timeout.
            setIsConnecting(false); // Ensure connecting is false on error
        }
        // finally block removed as connecting state is handled by events now
    };

    // Setup event listeners using useEffect
    useEffect(() => {
        const handleCallStart = () => {
            console.log("Vapi call started.");
            setIsCallActive(true);
            setIsConnecting(false);
            setError(null);
        };

        const handleCallEnd = () => {
            console.log("Vapi call ended.");
            setIsCallActive(false);
            setIsConnecting(false);
            setError(null);
        };

        const handleError = (e: any) => {
            console.error("Vapi error:", e);
            setError(`An error occurred: ${e.message || e}`);
            setIsCallActive(false); // Assume call ended on error
            setIsConnecting(false);
        };

        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("error", handleError);

        // Cleanup function to remove listeners when the component unmounts
        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("error", handleError);
        };
    }, []); // Empty dependency array ensures this runs only once on mount


    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center text-[#2C3E50] overflow-hidden p-4">
            <h1 className="text-4xl font-extrabold mb-4 text-center">Interview Session</h1> {/* Reduced margin */}

            {/* AI Avatar / Status Indicator */}
            {isCallActive && (
                <div className="mb-6 flex flex-col items-center"> {/* Reduced margin */}
                    <div className="relative flex items-center justify-center w-24 h-24">
                        {/* Pulsing background */}
                        <div className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></div>
                        {/* Static foreground circle with icon */}
                        <div className="relative inline-flex rounded-full h-20 w-20 bg-blue-500 items-center justify-center">
                             <Wifi className="w-10 h-10 text-white" />
                        </div>
                    </div>
                     <p className="mt-3 text-sm font-medium text-blue-600">AI Assistant Connected</p>
                </div>
            )}

            <p className="text-lg text-[#4A4A4A] mb-8 text-center max-w-2xl">
                {isCallActive
                    ? "Your interview call is in progress."
                    : "Start the call when you are ready to begin your mock interview."}
            </p>

            {error && (
                <p className="text-red-600 bg-red-100 border border-red-400 rounded px-4 py-2 mb-6 text-center">
                    {error}
                </p>
            )}

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {!isCallActive ? (
                    <button
                        onClick={startCall}
                        disabled={isConnecting}
                        className={`inline-flex items-center px-8 py-4 text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-200 border-2 border-green-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <PhoneIncoming className="w-6 h-6 mr-2" />
                        {isConnecting ? "Connecting..." : "Start Call"}
                    </button>
                ) : (
                    <button
                        onClick={endCall}
                        disabled={isConnecting} // Disable while ending
                        className={`inline-flex items-center px-8 py-4 text-lg font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200 border-2 border-red-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <PhoneOff className="w-6 h-6 mr-2" />
                        {isConnecting ? "Ending..." : "End Call"}
                    </button>
                )}
            </div>

            {/* Optional: Display Interview ID */}
            <p className="mt-8 text-sm text-gray-500">Interview ID: {params.id}</p>
        </div>
    );
}