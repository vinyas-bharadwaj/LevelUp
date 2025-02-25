'use client'

import type React from "react";
import Navbar from "@/app/components/navbar";
import { AuthProvider } from "@/app/context/AuthContext";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} `}>
        <AuthProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-6 py-12">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
