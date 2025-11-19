'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '../../components/Header'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <CheckCircleIcon className="h-16 w-16 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful! 🎉
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {sessionId && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Order Details</h2>
            <p className="text-sm text-gray-500 mb-4">
              Session ID: {sessionId}
            </p>
            <div className="text-sm text-gray-600">
              <p>✅ Payment confirmed</p>
              <p>📦 Order created in our system</p>
              <p>📧 Confirmation email will be sent shortly</p>
              <p>🚚 Your items will be shipped within 1-2 business days</p>
            </div>
          </div>
        )}

        {!sessionId && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Order Completed</h2>
            <div className="text-sm text-gray-600">
              <p>✅ Payment processed successfully</p>
              <p>📦 Order has been created</p>
              <p>📧 Confirmation email sent</p>
              <p>🚚 Your items will be shipped within 1-2 business days</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <a
            href="/orderhistory"
            className="block w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            View Order History
          </a>
          <a
            href="/"
            className="block w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  )
}