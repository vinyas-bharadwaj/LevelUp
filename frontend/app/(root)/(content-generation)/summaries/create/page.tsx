'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from 'next/navigation';
import Alert from "@/app/components/alert";

// Define interfaces for form data and alert
interface FormData {
  word_length: number;
  detail_level: "low" | "medium" | "high";
  file: File | null;
}

interface AlertProps {
  type: "success" | "error";
  message: string;
}

const SummaryGeneratorForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    word_length: 150,
    detail_level: "medium",
    file: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const router = useRouter();

  // Get access token from localStorage on component mount
  useEffect(() => {
    try {
      const authTokens = localStorage.getItem("authTokens");
      if (authTokens) {
        const tokens = JSON.parse(authTokens);
        setAccessToken(tokens.access_token);
      }
    } catch (error) {
      console.error("Error getting access token:", error);
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "word_length" ? parseInt(value, 10) : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFormData((prev) => ({
        ...prev,
        file: selectedFile
      }));
      setFileName(selectedFile.name);
    } else {
      setFormData((prev) => ({
        ...prev,
        file: null
      }));
      setFileName("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous alerts
    setAlert(null);
   
    // Check for authentication
    if (!accessToken) {
      setAlert({
        type: "error",
        message: "Authentication required. Please log in."
      });
      return;
    }
   
    // Validate that a file is selected
    if (!formData.file) {
      setAlert({
        type: "error",
        message: "Please upload a file to summarize"
      });
      return;
    }

    setLoading(true);
    try {
      // Create URL with query parameters
      const url = new URL("http://127.0.0.1:8000/summary/generate-summary");
      url.searchParams.append("word_length", formData.word_length.toString());
      url.searchParams.append("detail_level", formData.detail_level);
      
      // Create FormData for the file
      const formDataToSend = new FormData();
      formDataToSend.append("file", formData.file);
      
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formDataToSend,
      });
      
      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            // Fallback to default error message
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
     
      // Reset form after successful submission
      setFormData({
        word_length: 150,
        detail_level: "medium",
        file: null,
      });
      setFileName("");
     
      // Reset file input element
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
     
      setAlert({
        type: "success",
        message: "Summary generated successfully!"
      });

      // Redirect to the summary page using the summary ID
      router.push(`/summaries/${result.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setAlert({
        type: "error",
        message: errorMessage
      });
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md my-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Generate Summary</h2>
       
      {alert && <Alert type={alert.type} message={alert.message} />}
       
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="word_length" className="block text-sm font-medium text-gray-700">
            Summary Length (words)
          </label>
          <input
            type="number"
            id="word_length"
            name="word_length"
            min="50"
            max="500"
            value={formData.word_length}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
         
        <div className="space-y-2">
          <label htmlFor="detail_level" className="block text-sm font-medium text-gray-700">
            Detail Level
          </label>
          <select
            id="detail_level"
            name="detail_level"
            value={formData.detail_level}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="low">Low (Key points only)</option>
            <option value="medium">Medium (Main ideas and important details)</option>
            <option value="high">High (Comprehensive coverage)</option>
          </select>
        </div>
         
        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Upload Document *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOCX, or TXT up to 10MB
              </p>
              {fileName && (
                <p className="text-sm text-gray-500">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </div>
        </div>
         
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C3E50] hover:bg-[#44505c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Generating Summary..." : "Generate Summary"}
        </button>
      </form>
    </div>
  );
};

export default SummaryGeneratorForm;