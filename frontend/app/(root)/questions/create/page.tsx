'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FileUp } from "lucide-react";
import Alert from "@/app/components/alert";

// Define interfaces for form data and props
interface FormData {
  test_title: string;
  num_questions: number;
  difficulty: "beginner" | "easy" | "medium" | "hard" | "very hard" | "expert";
  file: File | null;
}

interface ApiResponse {
  id?: string;
  questions?: Array<any>;
  [key: string]: any;
}

interface AlertProps {
  type: "success" | "error";
  message: string;
}

const TestGeneratorForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    test_title: "",
    num_questions: 5,
    difficulty: "medium",
    file: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

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
      [name]: name === "num_questions" ? parseInt(value, 10) : value,
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
      console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size);
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
        message: "Please upload a reference file"
      });
      return;
    }

    // Validate other required fields
    if (!formData.test_title.trim()) {
      setAlert({
        type: "error",
        message: "Test title is required"
      });
      return;
    }
   
    setLoading(true);
    try {
      // Create URL with query parameters for the required fields (except file)
      // FastAPI expects these as query parameters, not form fields
      const url = new URL("http://127.0.0.1:8000/questions/generate-questions/");
      url.searchParams.append("test_title", formData.test_title);
      url.searchParams.append("num_questions", formData.num_questions.toString());
      url.searchParams.append("difficulty", formData.difficulty);
      
      console.log("Submitting to URL:", url.toString());
      
      // Create FormData for the file only
      const formDataToSend = new FormData();
      if (formData.file) {
        // FastAPI expects the file parameter to be named "file"
        formDataToSend.append("file", formData.file);
      }
      
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formDataToSend,
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // If can't parse JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            // Fallback to default error message
          }
        }
        
        console.error("Error response:", errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Success response:", result);
     
      // Store the response in localStorage
      localStorage.setItem("generatedTest", JSON.stringify(result));
     
      // Reset form after successful submission
      setFormData({
        test_title: "",
        num_questions: 5,
        difficulty: "medium",
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
        message: "Test generated successfully!"
      });
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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Generate Test Questions</h2>
       
      {alert && <Alert type={alert.type} message={alert.message} />}
       
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="test_title" className="block text-sm font-medium text-gray-700">
            Test Title
          </label>
          <input
            type="text"
            id="test_title"
            name="test_title"
            value={formData.test_title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
         
        <div className="space-y-2">
          <label htmlFor="num_questions" className="block text-sm font-medium text-gray-700">
            Number of Questions
          </label>
          <input
            type="number"
            id="num_questions"
            name="num_questions"
            min="1"
            max="50"
            value={formData.num_questions}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
         
        <div className="space-y-2">
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
            Difficulty Level
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="very hard">Very Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
         
        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Upload Reference Material *
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
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Test Questions"}
        </button>
      </form>
    </div>
  );
};

export default TestGeneratorForm;