'use client'
import { useState, useEffect } from 'react'

// Hook to fetch products from database
export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}

// Hook to fetch single product
export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok) throw new Error('Failed to fetch product')
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}

// Hook for cart operations
export function useCart(userId = 'demo-user') {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cart?userId=${userId}&t=${Date.now()}`) // Add timestamp to prevent caching
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
        setRefreshTrigger(prev => prev + 1) // Trigger re-render
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
      // Extract productId properly - handle both string IDs and numeric IDs
      const productId = typeof product === 'object' ? product.id : product

      const requestData = {
        userId,
        productId: productId, // Keep as string
        quantity: 1,
        colorName: options.colorName || null,
        size: options.size || null
      }
      
      console.log('Adding to cart:', requestData)

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      if (response.ok) {
        // Immediately fetch cart to update state
        await fetchCart()
        console.log('Successfully added to cart and refreshed')
        return true
      } else {
        const errorData = await response.json()
        console.error('Failed to add to cart:', errorData)
        return false
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
    }
    return false
  }

  // Update cart item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, quantity })
      })
      
      if (response.ok) {
        await fetchCart() // Refresh cart
      } else {
        console.error('Failed to update quantity')
      }
    } catch (err) {
      console.error('Error updating cart:', err)
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchCart() // Refresh cart
      } else {
        console.error('Failed to remove from cart')
      }
    } catch (err) {
      console.error('Error removing from cart:', err)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [userId])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
    refreshCart: fetchCart
  }
}