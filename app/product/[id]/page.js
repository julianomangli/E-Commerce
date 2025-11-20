"use client";
import React, { useState, useEffect } from "react";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import ProductImageCarousel from "../../components/ProductImageCarousel";
import { useCart } from "../../../contexts/CartContext";
import { useWishlist } from "../../../contexts/WishlistContext";

function Collapsible({ title, children, open, onClick }) {
  return (
    <div className="py-4">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <span className="text-gray-400 text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function ProductDetailsPage({ params }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [openSection, setOpenSection] = useState("features");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${resolvedParams.id}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          
          // Set default selections from variants or direct properties
          const colors = productData.colors || [];
          const sizes = productData.sizes || [];
          
          // If no direct colors/sizes, extract from variants
          if (colors.length === 0 && productData.variants) {
            const colorVariants = productData.variants.filter(v => v.type === 'color');
            const sizeVariants = productData.variants.filter(v => v.type === 'size');
            
            if (colorVariants.length > 0) {
              setSelectedColor(colorVariants[0].hex || colorVariants[0].value);
            }
            if (sizeVariants.length > 0) {
              setSelectedSize(sizeVariants[0].value);
            }
          } else {
            // Use direct properties
            if (colors.length > 0) {
              setSelectedColor(colors[0].hex || colors[0].name);
            }
            if (sizes.length > 0) {
              setSelectedSize(sizes[0]);
            }
          }
          
          // Track product view
          if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackProductView(resolvedParams.id, {
              name: productData.name,
              category: productData.category,
              price: productData.price
            });
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams.id, router]);

  const handleAddToCart = async () => {
    if (addingToCart) return;
    
    // Check if size is required and selected for products with size variants
    const sizeVariants = product.variants?.filter(v => v.type === 'size') || [];
    const availableSizes = product.sizes || sizeVariants.map(v => v.value);
    
    if (availableSizes.length > 0 && !selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }
    
    setAddingToCart(true);
    try {
      const success = await addToCart(product, {
        colorName: selectedColor,
        size: selectedSize
      });
      if (success) {
        // Track add to cart event
        if (typeof window !== 'undefined' && window.analytics) {
          window.analytics.trackAddToCart(product.id, {
            name: product.name,
            category: product.category,
            color: selectedColor,
            size: selectedSize
          }, product.price);
        }
        
        // Show success feedback
        const button = document.querySelector('[data-add-to-cart]');
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✓ Added to Cart!';
          button.classList.add('bg-green-600');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      // Track remove from wishlist
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.trackRemoveFromWishlist(product.id, {
          name: product.name,
          category: product.category
        });
      }
    } else {
      addToWishlist(product);
      // Track add to wishlist
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.trackAddToWishlist(product.id, {
          name: product.name,
          category: product.category
        });
      }
    }
  };

  const toggleSection = (section) =>
    setOpenSection(openSection === section ? "" : section);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <button
              onClick={() => router.push('/')}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Product Images */}
        <div className="space-y-6">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            <ProductImageCarousel 
              images={product.images || [{ url: product.imageSrc, alt: product.imageAlt }]} 
              productName={product.name}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-4xl font-bold text-green-700 flex items-center">
                  <span className="text-green-600 text-2xl mr-2">€</span>
                  {product.price.toFixed(2)}
                  <span className="ml-3 text-lg font-normal text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    Free Shipping
                  </span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description || "No description available."}
          </p>

          {/* Color Selection - Only show if there are multiple different colors */}
          {(() => {
            const availableColors = product.colors || 
              product.variants?.filter(v => v.type === 'color').map(v => ({ name: v.value, hex: v.hex })) || [];
            
            // Get unique color values
            const uniqueColors = availableColors.filter((color, index, self) => 
              index === self.findIndex(c => (c.name || c.hex) === (color.name || color.hex))
            );
            
            return uniqueColors.length > 1;
          })() && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
              <div className="flex gap-3">
                {(() => {
                  const availableColors = product.colors || 
                    product.variants?.filter(v => v.type === 'color').map(v => ({ name: v.value, hex: v.hex })) || [];
                  
                  // Get unique colors only
                  const uniqueColors = availableColors.filter((color, index, self) => 
                    index === self.findIndex(c => (c.name || c.hex) === (color.name || color.hex))
                  );
                  
                  return uniqueColors;
                })().map((color) => (
                  <button
                    key={color.name || color.hex}
                    onClick={() => setSelectedColor(color.hex || color.name)}
                    className={`relative w-10 h-10 rounded-full border-3 transition-all shadow-lg hover:shadow-xl ${
                      selectedColor === (color.hex || color.name)
                        ? "border-gray-900 scale-110 ring-2 ring-gray-900 ring-offset-2"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.hex || color.name }}
                    title={color.name}
                  >
                    {selectedColor === (color.hex || color.name) && (
                      <div className="absolute inset-1 rounded-full border-2 border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {((product.sizes && product.sizes.length > 0) || 
            (product.variants && product.variants.filter(v => v.type === 'size').length > 0)) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {(product.sizes || 
                  product.variants?.filter(v => v.type === 'size').map(v => v.value) || []
                ).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-4 text-sm font-medium rounded-lg border transition-all ${
                      selectedSize === size
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-900 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart and Wishlist Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={handleAddToCart}
              disabled={addingToCart || !product.inStock}
              data-add-to-cart
              className={`group relative flex-1 flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-black/20 overflow-hidden ${
                product.inStock && !addingToCart
                  ? "bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">
                {addingToCart ? "Adding..." : product.inStock ? "Add to Cart" : "Out of Stock"}
              </span>
              <svg 
                className="relative ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button 
              onClick={() => {
                if (isInWishlist(product.id)) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist(product);
                }
              }}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isInWishlist(product.id)
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              }`}
              title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist(product.id) ? (
                <HiHeart size={26} />
              ) : (
                <HiOutlineHeart size={26} />
              )}
            </button>
          </div>

          <div className="divide-y divide-gray-200 border-t border-gray-200">
            <Collapsible
              title="Features"
              open={openSection === "features"}
              onClick={() => toggleSection("features")}
            >
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                {(product.features || []).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </Collapsible>

            <Collapsible
              title="Care"
              open={openSection === "care"}
              onClick={() => toggleSection("care")}
            >
              <p className="text-sm text-gray-600 mt-2">{product.care}</p>
            </Collapsible>

            <Collapsible
              title="Shipping"
              open={openSection === "shipping"}
              onClick={() => toggleSection("shipping")}
            >
              <p className="text-sm text-gray-600 mt-2">{product.shipping}</p>
            </Collapsible>

            <Collapsible
              title="Returns"
              open={openSection === "returns"}
              onClick={() => toggleSection("returns")}
            >
              <p className="text-sm text-gray-600 mt-2">{product.returns}</p>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}
