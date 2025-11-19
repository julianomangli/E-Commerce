"use client";
import { useState } from "react";
import { HiHeart, HiShoppingBag, HiTrash } from "react-icons/hi";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(new Set());

  const handleAddToCart = async (product) => {
    if (addingToCart.has(product.id)) return;
    
    setAddingToCart(prev => new Set(prev).add(product.id));
    try {
      const success = await addToCart(product);
      if (success) {
        // Optionally remove from wishlist after adding to cart
        // removeFromWishlist(product.id);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleClearWishlist = () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlist();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlist.length === 0 
                ? "Your wishlist is empty" 
                : `${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} saved for later`
              }
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <HiTrash className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <HiHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save items you love by clicking the heart icon on any product</p>
            <button
              onClick={() => router.push('/')}
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.imageSrc || product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => router.push(`/product/${product.id}`)}
                  />
                  
                  {/* Remove from Wishlist Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from wishlist"
                  >
                    <HiHeart className="w-5 h-5 text-red-500" />
                  </button>
                  
                  {/* Stock Status */}
                  {!product.inStock && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-gray-700 transition-colors line-clamp-2"
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <p className="text-xl font-bold text-gray-900 mb-4">
                    €{product.price.toFixed(2)}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart.has(product.id) || !product.inStock}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium transition-all ${
                        product.inStock
                          ? "bg-black text-white hover:bg-gray-800 active:scale-95"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <HiShoppingBag className="w-4 h-4" />
                      <span>
                        {addingToCart.has(product.id) 
                          ? "Adding..." 
                          : product.inStock 
                          ? "Add to Cart" 
                          : "Out of Stock"
                        }
                      </span>
                    </button>
                    
                    <button
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="View details"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlist.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}