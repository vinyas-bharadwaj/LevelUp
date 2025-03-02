import { Book, FileCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-[#2C3E50] bg-[#F7F9FC] overflow-hidden">
      {/* Background Art */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#E0E6ED] rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#4A90E2] rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#CCD6E0] rounded-full opacity-40 blur-2xl"></div>
      </div>

      {/* Main Content */}
      <h1 className="text-5xl font-extrabold mb-6">Welcome to LevelUp</h1>
      <p className="text-lg text-[#4A4A4A] mb-8 text-center max-w-2xl">
        Elevate your skills with our cutting-edge learning platform. Explore curated courses, watch tutorials, and test your knowledge.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          href="/courses"
          className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3A7BCC] transition duration-200"
        >
          <Book className="w-6 h-6 mr-2" />
          Browse Courses
        </Link>
        <Link
          href="/questions/create"
          className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-[#2C3E50] bg-[#E0E6ED] hover:bg-[#CCD6E0] transition duration-200"
        >
          <FileCheck className="w-6 h-6 mr-2" />
          Generate Test
        </Link>
      </div>
    </div>
  );
}
