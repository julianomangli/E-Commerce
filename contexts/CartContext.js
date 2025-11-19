'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = 'demo-user'

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cart?userId=${userId}&t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        // Filter out items with null products or invalid quantities
        const validItems = data.filter(item => 
          item.product && 
          item.product.id && 
          item.quantity > 0 &&
          typeof item.quantity === 'number'
        )
        setCartItems(validItems)
      }
    } catch (err) {
      console.error('Error fetching cart:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (product, options = {}) => {
    try {
      const productId = typeof product === 'object' ? product.id : product

      const requestData = {
        userId,
        productId: productId,
        quantity: 1,
        colorName: options.colorName || null,
        size: options.size || null
      }
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      if (response.ok) {
        // Immediately refresh cart
        await fetchCart()
        return true
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { error: 'Failed to parse error response' }
        }
        console.error('Cart Context - failed to add to cart:', errorData)
        return false
      }
    } catch (err) {
      console.error('Cart Context - error adding to cart:', err)
      return false
    }
  }

  // Update cart item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      
      // Optimistically update the local state first
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      )
      
      // Then sync with the server in the background
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, quantity })
      })
      
      if (response.ok) {
        // Quantity updated successfully
      } else {
        // If server update fails, revert to server state
        const errorData = await response.json()
        console.error('Cart Context - failed to update quantity:', errorData)
        await fetchCart()
      }
    } catch (err) {
      console.error('Cart Context - error updating quantity:', err)
      // If error occurs, revert to server state
      await fetchCart()
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      // Optimistically remove the item from local state first
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
      
      // Then sync with the server in the background
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        console.log('Cart Context - item removed successfully')
      } else {
        console.error('Failed to remove from cart')
        // If server update fails, revert to server state
        await fetchCart()
      }
    } catch (err) {
      console.error('Error removing from cart:', err)
      // If error occurs, revert to server state
      await fetchCart()
    }
  }

  // Clean up invalid cart items
  const cleanupCart = async () => {
    try {
      const response = await fetch('/api/cart/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Cart cleanup:', result.message)
      }
    } catch (err) {
      console.error('Error cleaning cart:', err)
    }
  }

  useEffect(() => {
    const initializeCart = async () => {
      await cleanupCart() // Clean up invalid items first
      await fetchCart()   // Then fetch clean cart
    }
    initializeCart()
  }, [])

  const totalItems = cartItems.reduce((sum, item) => {
    // Only count items with valid products and positive quantities
    if (item.product && item.quantity > 0) {
      return sum + item.quantity
    }
    return sum
  }, 0)
  
  const totalPrice = cartItems.reduce((sum, item) => {
    // Safely access product price, default to 0 if product is null/undefined
    const price = item.product?.price || 0
    if (item.product && item.quantity > 0) {
      return sum + (price * item.quantity)
    }
    return sum
  }, 0)

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
    refreshCart: fetchCart,
    cleanupCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}