import { useState, useEffect } from 'react'

export function usePrintful() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrintfulProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/printful')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch Printful products')
      console.error('Printful fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSingleProduct = async (productId) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/printful?id=${productId}`)
      const data = await response.json()
      
      if (data.success) {
        return data.product
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError('Failed to fetch product details')
      console.error('Product fetch error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const syncProduct = async (productId) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/printful', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_product',
          productId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data.product
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError('Failed to sync product')
      console.error('Sync error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrintfulProducts()
  }, [])

  return {
    products,
    loading,
    error,
    fetchPrintfulProducts,
    fetchSingleProduct,
    syncProduct,
    refetch: fetchPrintfulProducts
  }
}