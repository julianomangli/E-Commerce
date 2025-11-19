'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '../../contexts/CartContext'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CartSection({ open, setOpen }) {
  const { cartItems, loading, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (isUpdating) return // Prevent double clicks
    
    setIsUpdating(true)
    try {
      console.log('Updating quantity:', { itemId, newQuantity })
      await updateQuantity(itemId, newQuantity)
      console.log('Quantity updated successfully')
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveItem = async (itemId) => {
    setIsUpdating(true)
    try {
      await removeFromCart(itemId)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
          shippingDetails: {
            shippingMethod: 'standard', // Default shipping method
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate checkout. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const formatVariant = (colorName, size) => {
    const parts = [colorName, size].filter(Boolean)
    return parts.length > 0 ? parts.join(' / ') : 'Default'
  }
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
      />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition-transform duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900">Shopping cart</DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      ) : cartItems.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1.5 8H6.5L5 9z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-sm">Your cart is empty</p>
                          <p className="text-gray-400 text-xs mt-1">Add some products to get started</p>
                        </div>
                      ) : (
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {cartItems.map((item) => {
                              // Safety check - skip items with missing product data
                              if (!item.product) {
                                return null;
                              }
                              
                              return (
                              <li key={item.id} className="flex py-6">
                                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img 
                                    alt={item.product?.imageAlt || item.product?.name || 'Product image'} 
                                    src={item.product?.imageSrc || '/placeholder-image.jpg'} 
                                    className="size-full object-cover" 
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <Link href={`/product/${item.product?.id || '#'}`} className="hover:text-gray-700">
                                          {item.product?.name || 'Unknown Product'}
                                        </Link>
                                      </h3>
                                      <p className="ml-4">€{((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{formatVariant(item.colorName, item.size)}</p>
                                    <p className="text-sm text-gray-400">€{(item.product?.price || 0).toFixed(2)} each</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (!isUpdating && item.quantity > 1) {
                                            handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                                          }
                                        }}
                                        disabled={isUpdating || item.quantity <= 1}
                                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                                      >
                                        -
                                      </button>
                                      <span className="text-gray-600 min-w-[2rem] text-center">Qty {item.quantity}</span>
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (!isUpdating) {
                                            handleUpdateQuantity(item.id, item.quantity + 1)
                                          }
                                        }}
                                        disabled={isUpdating}
                                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex">
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveItem(item.id)}
                                        disabled={isUpdating}
                                        className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isUpdating ? 'Updating...' : 'Remove'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    {cartItems.length > 0 && (
                      <>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal ({totalItems} items)</p>
                          <p>€{totalPrice.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="group relative w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-black to-gray-800 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:from-gray-800 hover:to-black transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-black/20 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {isCheckingOut ? (
                              <>
                                <div className="relative animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                                <span className="relative">Processing...</span>
                              </>
                            ) : (
                              <>
                                <span className="relative">Secure Checkout</span>
                                <svg 
                                  className="relative ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l3-3m0 0l-3-3m3 3H4" />
                                </svg>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                      <p>
                        {cartItems.length > 0 ? 'or ' : ''}
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="font-medium text-black hover:text-gray-700"
                        >
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
  )
}
