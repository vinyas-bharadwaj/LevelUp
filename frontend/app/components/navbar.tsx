import type React from "react";
import Link from "next/link";
import { Book, Video, FileCheck, LogIn, UserPlus, User } from "lucide-react";

// NavLink component
const NavLink = ({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <Link
    href={href}
    className="text-gray-100 hover:text-white hover:bg-teal-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center"
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </Link>
);

// Navbar component
const Navbar = () => {

  return (
    <nav className="bg-gradient-to-r from-teal-700 via-teal-600 to-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="ml-2 text-2xl font-bold text-white">LevelUp</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-1">
            <NavLink href="/courses" icon={<Book className="w-5 h-5" />}>Courses</NavLink>
            <NavLink href="/tutorials" icon={<Video className="w-5 h-5" />}>Tutorials</NavLink>
            <NavLink href="/tests" icon={<FileCheck className="w-5 h-5" />}>Tests</NavLink>
            <NavLink href="/login" icon={<LogIn className="w-5 h-5" />}>Login</NavLink>
            <NavLink href="/signup" icon={<UserPlus className="w-5 h-5" />}>Sign Up</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
