"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="bg-white text-gray-700 flex items-center">
        <div className="w-full max-w-md mx-auto px-6 py-12">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-10">
            <div className="h-5 w-5 rounded-full bg-black" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/signin" className="text-black hover:text-gray-700">
              Sign in
            </a>
          </p>

          <form className="mt-8 space-y-5">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Full name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-md bg-white border border-gray-300 focus:border-black focus:outline-none px-3 py-2 text-gray-900 placeholder-gray-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md bg-white border border-gray-300 focus:border-black focus:outline-none px-3 py-2 text-gray-900 placeholder-gray-400"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-md bg-white border border-gray-300 focus:border-black focus:outline-none px-3 py-2 text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                className="mt-0.5 rounded border-gray-300 bg-white text-black focus:ring-0"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-black hover:text-gray-700">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-black hover:text-gray-700">
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              className="group relative w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-black to-gray-800 px-6 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-gray-800 hover:to-black transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-black/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Create account</span>
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-gray-300 flex-1" />
            <span className="text-xs text-gray-500">Or continue with</span>
            <div className="h-px bg-gray-300 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 shadow-lg hover:shadow-xl hover:from-gray-200 hover:to-gray-300 transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-300/20">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <FcGoogle className="relative text-lg" />
              <span className="relative">Google</span>
            </button>
            <button className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-800 to-black px-4 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:from-black hover:to-gray-800 transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-black/20">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <FaGithub className="relative text-lg" />
              <span className="relative">GitHub</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"
          alt="Shopping"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
