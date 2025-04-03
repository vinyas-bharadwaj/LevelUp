"use client";

import React, { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Alert from "@/app/components/alert";

// Define types
interface AuthTokens {
  access_token: string;
}

interface User {
  username: string;
  email?: string;
  exp?: number; // Add expiration timestamp from JWT
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  loginUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  signupUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  logoutUser: () => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
    if (typeof window !== "undefined") {
      const storedTokens = localStorage.getItem("authTokens");
      return storedTokens ? JSON.parse(storedTokens) : null;
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined" && authTokens) {
      try {
        return jwtDecode<User>(authTokens.access_token);
      } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
      }
    }
    return null;
  });

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!user || !user.exp) return true;
    
    // Get current time in seconds (JWT exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Add a buffer of 60 seconds to refresh the token before it actually expires
    return user.exp - currentTime < 60;
  }, [user]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (!authTokens) return;
    
    // Store the current username from the decoded token
    const username = user?.username;
    
    // We'll need to have stored the password somewhere secure or prompt the user to login again
    // For security reasons, we cannot store the password in localStorage or state
    
    // Option 1: Redirect to login when token is about to expire
    setAlertMessage("Your session is about to expire. Please login again.");
    setAlertType("warning");
    setTimeout(() => {
      logoutUser();
    }, 3000);
  }, [authTokens, user]);

  // Check token status periodically
  useEffect(() => {
    if (!authTokens) return;

    // Initial check when component mounts
    if (isTokenExpired()) {
      refreshToken();
    }

    // Check every 5 minutes (or adjust based on your token lifespan)
    // For a 30-minute token, maybe check every 5-10 minutes
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        refreshToken();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [authTokens, isTokenExpired, refreshToken]);

  // Signup Function
  const signupUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.password.value !== form.confirmPassword.value) {
      setAlertMessage("Passwords do not match!");
      setAlertType("error");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.value,
          email: form.email.value,
          password: form.password.value,
        }),
      });

      if (response.status === 201) {
        setAlertMessage("Signup successful! Redirecting to login...");
        setAlertType("success");
        router.push("/login");
      } else {
        setAlertMessage("Something went wrong, try again");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAlertMessage("An unexpected error occurred. Please try again.");
      setAlertType("error");
    }
  };

  // Login Function
  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", (e.target as HTMLFormElement).username.value);
    formData.append("password", (e.target as HTMLFormElement).password.value);

    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setAuthTokens({
          access_token: data.access_token,  
        });
        setUser(jwtDecode<User>(data.access_token));
        localStorage.setItem("authTokens", JSON.stringify(data));
        setAlertMessage("Login successful! Redirecting...");
        setAlertType("success");
        router.push("/")
      } else {
        setAlertMessage("Invalid credentials");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertMessage("An unexpected error occurred. Please try again.");
      setAlertType("error");
    }
  };

  // Logout Function
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    setAlertMessage("You have been logged out.");
    setAlertType("info");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ signupUser, loginUser, logoutUser, user }}>
      {alertMessage && <Alert message={alertMessage} type={alertType} duration={3000} />}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
