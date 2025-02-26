'use client'

import React, { useContext } from "react";
import Link from "next/link";
import AuthContext from "@/app/context/AuthContext";
import { Book, Video, FileCheck, LogIn, UserPlus, LogOut } from "lucide-react";

// NavLink component
const NavLink = ({ href, icon, children }: { href: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <Link
    href={href}
    className="text-[#2C3E50] hover:text-[#4A90E2] px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center"
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </Link>
);

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext) || {};

  return (
    <nav className="bg-[#F7F9FC] shadow-md border-b border-[#E0E6ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="ml-2 text-2xl font-bold text-[#2C3E50]">LevelUp</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-3">
            <NavLink href="/courses" icon={<Book className="w-5 h-5" />}>Courses</NavLink>
            <NavLink href="/tutorials" icon={<Video className="w-5 h-5" />}>Tutorials</NavLink>
            <NavLink href="/tests" icon={<FileCheck className="w-5 h-5" />}>Tests</NavLink>

            {user ? (
              <button 
                onClick={logoutUser} 
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#E74C3C] hover:bg-[#C0392B] transition duration-150 ease-in-out flex items-center"
              >
                <LogOut className="w-5 h-5 inline-block mr-2" />
                Logout
              </button>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#4A90E2] hover:bg-[#3A7BCC] transition duration-150 ease-in-out"
                >
                  <LogIn className="w-5 h-5 inline-block mr-2" />
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#27AE60] hover:bg-[#1E914F] transition duration-150 ease-in-out"
                >
                  <UserPlus className="w-5 h-5 inline-block mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
