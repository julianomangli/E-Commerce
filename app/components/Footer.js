"use client";
import { FaFacebook, FaInstagram, FaGithub, FaYoutube } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Solutions */}
          <div>
            <h3 className="text-black font-semibold mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-black transition">Marketing</a></li>
              <li><a href="#" className="hover:text-black transition">Analytics</a></li>
              <li><a href="#" className="hover:text-black transition">Automation</a></li>
              <li><a href="#" className="hover:text-black transition">Commerce</a></li>
              <li><a href="#" className="hover:text-black transition">Insights</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-black font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-black transition">Submit ticket</a></li>
              <li><a href="#" className="hover:text-black transition">Documentation</a></li>
              <li><a href="#" className="hover:text-black transition">Guides</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-black font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-black transition">About</a></li>
              <li><a href="#" className="hover:text-black transition">Blog</a></li>
              <li><a href="#" className="hover:text-black transition">Jobs</a></li>
              <li><a href="#" className="hover:text-black transition">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-black font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-black transition">Terms of service</a></li>
              <li><a href="#" className="hover:text-black transition">Privacy policy</a></li>
              <li><a href="#" className="hover:text-black transition">License</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-black font-semibold mb-4">Subscribe to our newsletter</h3>
            <p className="text-sm text-gray-500 mb-4">
              The latest news, articles, and resources, sent to your inbox weekly.
            </p>
            <form className="flex" suppressHydrationWarning>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:border-black text-gray-700"
                autoComplete="email"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-r-md transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <p className="text-gray-500">
            © 2025 Mangli Website, Inc. All rights reserved.
          </p>
          <div className="flex space-x-5 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition"><FaFacebook size={20} /></a>
            <a href="#" className="hover:text-black transition"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-black transition"><RxCross1 size={20} /></a>
            <a href="#" className="hover:text-black transition"><FaGithub size={20} /></a>
            <a href="#" className="hover:text-black transition"><FaYoutube size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
