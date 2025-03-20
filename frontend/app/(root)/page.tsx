import { Book, FileCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-[#2C3E50] overflow-hidden">

      {/* Main Content */}
      <h1 className="text-5xl font-extrabold mb-6">Welcome to LevelUp</h1>
      <p className="text-lg text-[#4A4A4A] mb-8 text-center max-w-2xl">
        Elevate your skills with our cutting-edge learning platform. Explore curated courses, watch tutorials, and test your knowledge.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          href="/summaries/create"
          className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-white bg-[#354554] hover:bg-[#4f5862] transition duration-200 border-2 border-gray-800"
        >
          <Book className="w-6 h-6 mr-2" />
          Summarize Document
        </Link>
        <Link
          href="/questions/create"
          className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-md text-[#2C3E50] bg-[#E0E6ED] hover:bg-[#CCD6E0] transition duration-200 border-2 border-gray-800"
        >
          <FileCheck className="w-6 h-6 mr-2" />
          Generate Test
        </Link>
      </div>
    </div>
  );
}
