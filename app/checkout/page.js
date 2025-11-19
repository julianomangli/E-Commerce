"use client";
import { useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cartItems, totalPrice, loading: cartLoading } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Check for cancelled parameter and redirect to cart
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cancelled') === 'true') {
      router.push('/?cart=open');
      return;
    }

    // If cart is empty, redirect to home
    if (!cartLoading && cartItems.length === 0) {
      router.push('/');
      return;
    }

    // If we have cart items, redirect directly to Stripe Checkout
    if (!cartLoading && cartItems.length > 0) {
      handleStripeCheckout();
    }
  }, [cartItems, cartLoading]);

  const handleStripeCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
          shippingDetails: {
            shippingMethod: 'standard', // Default to standard shipping
          }
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe Checkout
      } else {
        console.error('Failed to create checkout session');
        router.push('/?error=checkout-failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      router.push('/?error=checkout-failed');
    }
  };

  // Show loading while processing
  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-600">Redirecting to secure checkout...</p>
      </div>
    </div>
  );
}