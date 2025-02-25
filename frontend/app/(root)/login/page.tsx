import Link from "next/link";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] text-[#2C3E50] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#4A90E2] focus:outline-none"
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
              className="w-full px-4 py-2 border rounded-md bg-[#F7F9FC] text-[#2C3E50] focus:ring-2 focus:ring-[#4A90E2] focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-sm">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-[#4A90E2] hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#4A90E2] hover:bg-[#3A7BCC] text-white font-medium py-2 rounded-md transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-[#4A4A4A] mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#4A90E2] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
