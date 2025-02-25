import type React from "react";
import Navbar from "@/app/components/navbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LevelUp - Educational Platform",
  description: "Enhance your skills with LevelUp courses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} `}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
