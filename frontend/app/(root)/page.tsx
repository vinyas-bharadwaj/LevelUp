import { Book, FileCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center  text-black px-4">
      <h1 className="text-5xl font-extrabold mb-6">Welcome to LevelUp</h1>
      <p className="text-lg text-black-300 mb-8 text-center max-w-2xl">
        Elevate your skills with our cutting-edge learning platform. Explore curated courses, watch tutorials, and test your knowledge.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          href="/courses"
          className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-black bg-teal-600 hover:bg-teal-700 transition duration-200"
        >
          <Book className="w-6 h-6 mr-2" />
          Browse Courses
        </Link>
        <Link
          href="/generate-test"
          className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-gray-900 bg-gray-300 hover:bg-gray-400 transition duration-200"
        >
          <FileCheck className="w-6 h-6 mr-2" />
          Generate Test
        </Link>
      </div>
    </div>
  );
}
