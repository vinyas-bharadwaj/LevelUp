"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { createPortal } from "react-dom";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // Auto-dismiss time in ms (optional)
}

const Alert = ({ message, type = "info", duration = 5000 }: AlertProps) => {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle client-side rendering for the portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  // Animation effects
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => setMounted(false), 300); // Wait for fade-out animation
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted) return null;

  // Map alert types to their respective icons
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className="text-green-500" />;
      case "error":
        return <AlertCircle size={18} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={18} className="text-yellow-500" />;
      case "info":
        return <Info size={18} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const toast = (
    <div
      className={clsx(
        "fixed top-4 right-4 z-50 flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg transition-all duration-300",
        {
          "bg-white border-l-4 border-green-500": type === "success",
          "bg-white border-l-4 border-red-500": type === "error",
          "bg-white border-l-4 border-yellow-500": type === "warning",
          "bg-white border-l-4 border-blue-500": type === "info",
          "opacity-100 translate-y-0": visible,
          "opacity-0 translate-y-[-20px]": !visible,
        }
      )}
      role="alert"
    >
      <div className="flex items-center">
        <div className="inline-flex items-center justify-center flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="text-sm font-medium text-gray-800 flex-grow mr-2">{message}</div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center"
          onClick={() => setVisible(false)}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full rounded-b-lg overflow-hidden">
          <div 
            className={clsx("h-full rounded-b-lg", {
              "bg-green-500": type === "success",
              "bg-red-500": type === "error",
              "bg-yellow-500": type === "warning",
              "bg-blue-500": type === "info",
            })}
            style={{ 
              width: "100%", 
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );

  // Use createPortal to render at the root level of the DOM
  return typeof document !== 'undefined' 
    ? createPortal(toast, document.body) 
    : null;
};

// Add keyframes for the progress bar animation
const globalStyles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;

// Inject global styles for the animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = globalStyles;
  document.head.appendChild(style);
}

export default Alert;
