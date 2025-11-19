"use client"
import { useState, useEffect } from 'react'
import { usePrintful } from '../../hooks/usePrintful'
import { PricingAnalytics } from '../components/PricingAnalytics'

export default function PrintfulAdminPage() {
  const { products, loading, error, fetchSingleProduct, syncProduct } = usePrintful()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  const handleProductClick = async (product) => {
    const fullProduct = await fetchSingleProduct(product.id)
    setSelectedProduct(fullProduct)
  }

  const handleSyncProduct = async (productId) => {
    setSyncing(true)
    setSyncMessage('')
    
    try {
      const syncedProduct = await syncProduct(productId)
      if (syncedProduct) {
        setSyncMessage(`Successfully synced: ${syncedProduct.name}`)
      }
    } catch (err) {
      setSyncMessage('Failed to sync product')
    } finally {
      setSyncing(false)
    }
  }

  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Printful products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Printful Store Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and sync products from your Printful store with optimized pricing for €5-10 profit per item
              </p>
            </div>
            <a
              href="/printful/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Configure Pricing
            </a>
          </div>
        </div>

        {/* Pricing Analytics */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Analytics</h2>
            <PricingAnalytics products={products} />
          </div>
        )}

        {syncMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-green-800">{syncMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Store Products ({products.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.imageSrc}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Sale: €{product.price?.toFixed(2)} • Printful Retail: €{product.printfulRetailPrice?.toFixed(2)}</div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Printful: €10.00
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            product.yourTotalProfit >= 15 ? 'bg-green-100 text-green-800' :
                            product.yourTotalProfit >= 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Total: €{product.yourTotalProfit?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSyncProduct(product.id)
                      }}
                      disabled={syncing}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                    >
                      {syncing ? 'Syncing...' : 'Sync'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
            </div>
            <div className="p-6">
              {selectedProduct ? (
                <div className="space-y-6">
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={selectedProduct.imageSrc}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedProduct.name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="text-lg font-semibold text-gray-900">
                        €{selectedProduct.price?.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Printful Retail: €{selectedProduct.printfulRetailPrice?.toFixed(2)}
                      </div>
                      <div className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Printful: €10.00
                      </div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.yourTotalProfit >= 15 ? 'bg-green-100 text-green-800' :
                        selectedProduct.yourTotalProfit >= 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Total: €{selectedProduct.yourTotalProfit?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.description || 'No description available'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Product Info</h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500">SKU</dt>
                        <dd className="text-gray-900">{selectedProduct.sku}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Category</dt>
                        <dd className="text-gray-900">{selectedProduct.subcategory}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Brand</dt>
                        <dd className="text-gray-900">{selectedProduct.brand}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Stock</dt>
                        <dd className="text-gray-900">
                          {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Variants & Pricing</h4>
                      <div className="space-y-2">
                        {selectedProduct.variants.map((variant, index) => (
                          <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">{variant.value}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-900 font-medium">€{variant.price?.toFixed(2)}</span>
                              <span className="text-xs text-gray-500">(Cost: €{variant.originalPrice?.toFixed(2)})</span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                variant.profit >= 8 ? 'bg-green-100 text-green-800' :
                                variant.profit >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                +€{variant.profit?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Images</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedProduct.images.slice(1, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image.imageUrl}
                            alt={image.altText}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a product to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}