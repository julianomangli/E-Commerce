'use client'
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Carousel, { demoSlides } from './components/Carousel';
import ProductGrid from "./components/ProductGrid";
import FeaturesSection from "./components/FeaturesSection"
import Footer from "./components/Footer"
import { useProducts } from "../hooks/useDatabase";
import { useCart } from "../contexts/CartContext";

export default function Home() {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check for URL parameters to handle redirects from checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cart') === 'open') {
      setCartOpen(true);
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('error') === 'checkout-failed') {
      setShowError(true);
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Auto hide error after 5 seconds
      setTimeout(() => setShowError(false), 5000);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
        <FeaturesSection />
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading products</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
        <FeaturesSection />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header cartOpen={cartOpen} setCartOpen={setCartOpen} />
      
      {/* Error notification */}
      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-6 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Checkout failed
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p>There was an issue processing your checkout. Please try again.</p>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowError(false)}
                  className="bg-red-50 text-red-800 rounded-md p-2 hover:bg-red-100 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Carousel slides={demoSlides} autoPlay={true} interval={6000} />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Products
        </h1>
        <ProductGrid products={products} onAddToCart={addToCart} />
      </div>
      <FeaturesSection />
      <Footer />
    </main>
  );
}
