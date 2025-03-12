'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import AuthContext from '@/app/context/AuthContext';

export default function Login() {
  const { loginUser } = useContext(AuthContext) || {};
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  return (
    <div className="min-h-screen flex items-center justify-center text-[#2C3E50] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={loginUser}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#2C3E50] focus:outline-none"
              placeholder="Enter your username"
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
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#2C3E50] focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-[#2C3E50] hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#2C3E50] hover:bg-[#3a3f46] text-white font-medium py-2 rounded-md transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-[#4A4A4A] mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#4A90E2] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}