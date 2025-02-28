'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import AuthContext from '@/app/context/AuthContext';

export default function Signup() {
  const { signupUser } = useContext(AuthContext) || {};
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] text-[#2C3E50] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
        <form onSubmit={signupUser}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#4A90E2] focus:outline-none"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#4A90E2] focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#4A90E2] focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#4A90E2] focus:outline-none"
              placeholder="Re-enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#4A90E2] hover:bg-[#3A7BCC] text-white font-medium py-2 rounded-md transition duration-200"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-[#4A4A4A] mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4A90E2] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
