'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Admin authentication wrapper
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
      const checkAuth = () => {
        const isAdmin = localStorage.getItem('admin_authenticated')
        const loginTime = localStorage.getItem('admin_login_time')
        
        if (isAdmin === 'true' && loginTime) {
          const now = Date.now()
          const loginTimestamp = parseInt(loginTime)
          const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
          
          if (now - loginTimestamp < sessionDuration) {
            setIsAuthenticated(true)
          } else {
            // Session expired
            localStorage.removeItem('admin_authenticated')
            localStorage.removeItem('admin_login_time')
            router.push('/admin')
          }
        } else {
          router.push('/admin')
        }
        setLoading(false)
      }

      checkAuth()
    }, [router])

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">
            <svg className="animate-spin h-8 w-8 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Verifying authentication...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // Redirect happening
    }

    return <Component {...props} />
  }
}

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_login_time')
    router.push('/admin')
  }

  // Clear demo products and add real ones
  const clearDemoProducts = async () => {
    try {
      const result = await fetch('/api/clear-demo-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await result.json()
      
      if (result.ok) {
        alert('✅ Demo products cleared! Your real Printful products are now showing.')
        fetchProducts() // Refresh the product list
      } else {
        alert('❌ Error clearing demo products: ' + data.error)
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    }
  }

  // Sync products with image downloads
  const syncWithImages = async () => {
    try {
      const result = await fetch('/api/sync-printful-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await result.json()
      
      if (result.ok) {
        alert('✅ Products synced with images downloaded!')
        fetchProducts() // Refresh the product list
      } else {
        alert('❌ Error syncing with images: ' + data.error)
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    }
  }

  // Regular Printful sync (without image downloads)
  const syncPrintfulProducts = async () => {
    try {
      const response = await fetch('/api/admin/sync-printful', {
        method: 'POST',
      })
      const result = await response.json()
      if (result.success) {
        alert('✅ Printful products synced successfully!')
        fetchProducts()
      } else {
        alert('❌ Error syncing products: ' + result.error)
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Mangli Admin Panel</h1>
              <div className="ml-6 flex space-x-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'products'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'orders'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'analytics'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={syncPrintfulProducts}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Sync Printful
              </button>
              <button
                onClick={syncWithImages}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📥 Full Sync + Images
              </button>
              <button
                onClick={clearDemoProducts}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🗑️ Clear Demo Products
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <ProductsTab 
            products={products} 
            loading={loading} 
            onProductUpdate={fetchProducts}
          />
        )}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  )
}

function ProductsTab({ products, loading, onProductUpdate }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    price: '',
    images: '',
    variants: [{ size: 'S', color: 'Black', price: '' }]
  })
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        return result.url
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      alert('❌ Upload failed: ' + error.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (event, isEdit = false) => {
    const files = Array.from(event.target.files)
    const uploadPromises = files.map(file => uploadImage(file))
    
    try {
      setUploading(true)
      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter(url => url !== null)
      
      if (isEdit) {
        // Add to edit form
        const currentImages = editFormData.images ? editFormData.images.split('\n').filter(url => url.trim()) : []
        const allImages = [...currentImages, ...validUrls]
        setEditFormData({
          ...editFormData,
          images: allImages.join('\n')
        })
      } else {
        // Add to create form
        const currentImages = newProductData.images ? newProductData.images.split('\n').filter(url => url.trim()) : []
        const allImages = [...currentImages, ...validUrls]
        setNewProductData({
          ...newProductData,
          images: allImages.join('\n')
        })
      }
      
      alert(`✅ ${validUrls.length} image(s) uploaded successfully!`)
    } catch (error) {
      alert('❌ Some uploads failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const openEditModal = (product) => {
    setSelectedProduct(product)
    
    // Get images from both sources
    let imageUrls = []
    if (product.images && product.images.length > 0) {
      imageUrls = product.images.map(img => img.url || img.imageUrl)
    } else if (product.imageSrc) {
      imageUrls = [product.imageSrc]
    }
    
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      images: imageUrls.join('\n'),
      variants: product.variants || []
    })
  }

  const updateProduct = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description,
          price: parseFloat(editFormData.price),
          images: editFormData.images.split('\n').filter(url => url.trim()),
        })
      })

      if (response.ok) {
        alert('✅ Product updated successfully!')
        setSelectedProduct(null)
        onProductUpdate()
      } else {
        alert('❌ Error updating product')
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    }
  }

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('✅ Product deleted successfully!')
        onProductUpdate()
      } else {
        alert('❌ Error deleting product')
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    }
  }

  const createProduct = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductData.name,
          description: newProductData.description,
          price: parseFloat(newProductData.price),
          images: newProductData.images.split('\n').filter(url => url.trim()),
          variants: newProductData.variants.map(v => ({
            ...v,
            price: parseFloat(v.price)
          }))
        })
      })

      if (response.ok) {
        alert('✅ Product created successfully!')
        setShowCreateForm(false)
        setNewProductData({
          name: '',
          description: '',
          price: '',
          images: '',
          variants: [{ size: 'S', color: 'Black', price: '' }]
        })
        onProductUpdate()
      } else {
        alert('❌ Error creating product')
      }
    } catch (error) {
      alert('❌ Error: ' + error.message)
    }
  }

  const addVariant = () => {
    setNewProductData({
      ...newProductData,
      variants: [...newProductData.variants, { size: '', color: '', price: '' }]
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <svg className="animate-spin h-8 w-8 text-white mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-400">Loading products...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Product Management</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ➕ Create New Product
          </button>
        </div>
        
        <div className="grid gap-6">
          {products.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
              <p className="text-gray-400 text-lg">No products found</p>
              <p className="text-gray-500 text-sm">Click "🔄 Sync Printful" to import products or "➕ Create New Product"</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-gray-700 rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {(() => {
                      // Try different image sources in priority order
                      const imageUrl = product.imageSrc || 
                                     product.images?.[0]?.url || 
                                     product.images?.[0]?.imageUrl;
                      
                      if (imageUrl && imageUrl !== 'https://via.placeholder.com/300') {
                        return (
                          <>
                            <img 
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                console.log('Image failed to load:', imageUrl);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-full h-full bg-gray-500 rounded-lg flex items-center justify-center text-gray-300 text-xs"
                              style={{ display: 'none' }}
                            >
                              No Image
                            </div>
                          </>
                        );
                      } else {
                        return (
                          <div className="w-full h-full bg-gray-500 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                            No Image
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="text-gray-400">€{product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{product.variants?.length || 0} variants</p>
                    <p className="text-sm text-gray-500">{product.images?.length || 0} images</p>
                    <p className="text-xs text-gray-600">
                      Main: {product.imageSrc || 'None'} | 
                      First: {product.images?.[0]?.url || product.images?.[0]?.imageUrl || 'None'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Create New Product</h3>
            
            <form onSubmit={createProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newProductData.description}
                  onChange={(e) => setNewProductData({...newProductData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProductData.price}
                  onChange={(e) => setNewProductData({...newProductData, price: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Product Images
                  </label>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors">
                    {uploading ? '⏳ Uploading...' : '📁 Upload Images'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <textarea
                  value={newProductData.images}
                  onChange={(e) => setNewProductData({...newProductData, images: e.target.value})}
                  rows={4}
                  placeholder="Upload images above or paste URLs here (one per line)&#10;/uploads/image1.jpg&#10;/uploads/image2.jpg"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: PNG, JPEG, WebP (max 5MB each)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Product Variants</label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    + Add Variant
                  </button>
                </div>
                {newProductData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Size (S, M, L, etc.)"
                      value={variant.size}
                      onChange={(e) => {
                        const updatedVariants = [...newProductData.variants]
                        updatedVariants[index].size = e.target.value
                        setNewProductData({...newProductData, variants: updatedVariants})
                      }}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="text"
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) => {
                        const updatedVariants = [...newProductData.variants]
                        updatedVariants[index].color = e.target.value
                        setNewProductData({...newProductData, variants: updatedVariants})
                      }}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) => {
                        const updatedVariants = [...newProductData.variants]
                        updatedVariants[index].price = e.target.value
                        setNewProductData({...newProductData, variants: updatedVariants})
                      }}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  🆕 Create Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Edit Product: {selectedProduct.name}</h3>
            
            <form onSubmit={updateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Product Images
                  </label>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors">
                    {uploading ? '⏳ Uploading...' : '📁 Upload Images'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <textarea
                  value={editFormData.images}
                  onChange={(e) => setEditFormData({...editFormData, images: e.target.value})}
                  rows={5}
                  placeholder="Upload images above or paste URLs here (one per line)&#10;/uploads/image1.jpg&#10;/uploads/image2.jpg"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Current images: {selectedProduct.images?.length || 0} | Supported: PNG, JPEG, WebP (max 5MB each)
                </p>
                
                {/* Image Preview */}
                {editFormData.images && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Image Preview:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {editFormData.images.split('\n').filter(url => url.trim()).slice(0, 8).map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url.trim()}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-16 object-cover rounded border border-gray-600"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function OrdersTab() {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Orders Management</h2>
      <p className="text-gray-400">Order management coming soon...</p>
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>
      <p className="text-gray-400">Analytics dashboard coming soon...</p>
    </div>
  )
}

export default withAuth(AdminDashboard)