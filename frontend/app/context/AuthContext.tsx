"use client";

import React, { createContext, useState, ReactNode } from "react";
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
      return jwtDecode<User>(authTokens.access_token);
    }
    return null;
  });

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
      const response = await fetch("http://localhost:8000/users/", {
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
      const response = await fetch("http://localhost:8000/login/", {
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
