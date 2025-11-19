"use client";
import { useState, useEffect } from "react";
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
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          // Set default selections
          if (productData.colors && productData.colors.length > 0) {
            setSelectedColor(productData.colors[0].hex || productData.colors[0].name);
          }
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
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
  }, [params.id, router]);

  const handleAddToCart = async () => {
    if (addingToCart) return;
    
    setAddingToCart(true);
    try {
      const success = await addToCart(product, {
        colorName: selectedColor,
        size: selectedSize
      });
      if (success) {
        // Could show a success message here
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
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
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-gray-900">
                €{product.price.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isInWishlist(product.id)
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              }`}
              title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist(product.id) ? (
                <HiHeart className="w-6 h-6" />
              ) : (
                <HiOutlineHeart className="w-6 h-6" />
              )}
            </button>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description || "No description available."}
          </p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name || color.hex}
                    onClick={() => setSelectedColor(color.hex || color.name)}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === (color.hex || color.name)
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.hex || color.name }}
                    title={color.name}
                  >
                    {selectedColor === (color.hex || color.name) && (
                      <div className="absolute inset-0 rounded-full border-2 border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
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

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !product.inStock}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all mb-8 ${
              product.inStock
                ? "bg-black text-white hover:bg-gray-800 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {addingToCart ? "Adding..." : product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          {/* Product Info Accordion */}
          <div className="divide-y divide-gray-200 border-t border-gray-200">
            {/* Features */}
            <Collapsible
              title="Features"
              open={openSection === "features"}
              onClick={() => toggleSection("features")}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Premium quality materials</p>
                <p>• Durable construction</p>
                <p>• Comfortable fit</p>
                <p>• Versatile design</p>
                <p>• Easy to maintain</p>
              </div>
            </Collapsible>

            {/* Care Instructions */}
            <Collapsible
              title="Care"
              open={openSection === "care"}
              onClick={() => toggleSection("care")}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Machine wash cold with similar colors</p>
                <p>• Use non-chlorine bleach only when needed</p>
                <p>• Tumble dry low</p>
                <p>• Cool iron if needed</p>
                <p>• Do not dry clean</p>
              </div>
            </Collapsible>

            {/* Shipping */}
            <Collapsible
              title="Shipping"
              open={openSection === "shipping"}
              onClick={() => toggleSection("shipping")}
            >
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Free shipping on orders over €100</p>
                <p>• Standard delivery: 2-5 business days</p>
                <p>• Express delivery available</p>
                <p>• 30-day returns policy</p>
                <p>• Return shipping is free for defective items</p>
              </div>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}