"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface AlertProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // Auto-dismiss time in ms (optional)
}

const Alert = ({ message, type = "info", duration = 3000 }: AlertProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={clsx(
        "flex items-center justify-between p-3 rounded-lg shadow-md transition-all duration-300",
        {
          "bg-green-100 text-green-800 border-l-4 border-green-500": type === "success",
          "bg-red-100 text-red-800 border-l-4 border-red-500": type === "error",
          "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500": type === "warning",
          "bg-blue-100 text-blue-800 border-l-4 border-blue-500": type === "info",
        }
      )}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        className="ml-3 text-gray-500 hover:text-gray-700"
        onClick={() => setVisible(false)}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Alert;
