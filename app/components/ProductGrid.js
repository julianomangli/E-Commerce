"use client";
import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useWishlist } from "../../contexts/WishlistContext";
import ProductImageCarousel from "./ProductImageCarousel";

/** Simple color helpers (unchanged, supports color names) **/
function parseColor(input) {
  if (
    typeof input === "object" &&
    input &&
    ("name" in input || "hex" in input)
  ) {
    const name = input.name ?? input.hex ?? "Color";
    const hex = input.hex ?? input.name ?? "#000000";
    return { name, hex };
  }
  const s = String(input || "").trim();
  const name = s.charAt(0).toUpperCase() + s.slice(1);
  const hex = s;
  return { name, hex };
}
function textClassFor(hex) {
  try {
    const c = (hex || "#000").replace("#", "");
    if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)) return "text-white";
    const full =
      c.length === 3
        ? c.split("").map((ch) => ch + ch).join("")
        : c;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "text-gray-900" : "text-white";
  } catch {
    return "text-white";
  }
}

export default function ProductGrid({ products = [], onAddToCart }) {
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const setColor = (productId, colorName) =>
    setSelectedColors((s) => ({ ...s, [productId]: colorName }));
  const setSize = (productId, size) =>
    setSelectedSizes((s) => ({ ...s, [productId]: size }));

  const handleAdd = async (product) => {
    const colors = Array.isArray(product.colors)
      ? product.colors.map(parseColor)
      : [];
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const requiresColor = colors.length > 0;
    const requiresSize = sizes.length > 0;
    const chosenColor = selectedColors[product.id];
    const chosenSize = selectedSizes[product.id];

    // Only check for required selections, don't show popups
    if (requiresColor && !chosenColor) return;
    if (requiresSize && !chosenSize) return;
    if (requiresColor && !chosenColor && requiresSize && !chosenSize) return;

    try {
      await onAddToCart?.(product, { colorName: chosenColor, size: chosenSize });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        No products available.
      </div>
    );
  }

  return (
    <>
      {/* Main horizontal scroller */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            className="
              flex gap-6 overflow-x-auto pb-4
              snap-x snap-mandatory
              [-ms-overflow-style:none] [scrollbar-width:thin]
            "
          >
            {/* simple scrollbar styling for WebKit */}
            <style>{`
              div::-webkit-scrollbar { height: 8px; }
              div::-webkit-scrollbar-thumb { border-radius: 8px; background: rgba(0,0,0,.25); }
              div::-webkit-scrollbar-track { background: transparent; }
            `}</style>

            {products.map((product) => {
              const colors = Array.isArray(product.colors)
                ? product.colors.map(parseColor)
                : [];
              const sizes = Array.isArray(product.sizes) ? product.sizes : [];
              const chosenColor = selectedColors[product.id];
              const chosenSize = selectedSizes[product.id];
              const isWished = isInWishlist(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative w-64 shrink-0 snap-start"
                >
                  {/* Image + Quick View overlay */}
                  <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                    <Link href={`/product/${product.id}`} prefetch={true}>
                      <ProductImageCarousel 
                        images={product.images || [{ url: product.imageSrc, alt: product.imageAlt }]} 
                        productName={product.name}
                      />
                    </Link>

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`absolute right-3 top-3 z-10 rounded-full p-2 shadow transition-all ${
                        isWished
                          ? "bg-rose-500 text-white hover:bg-rose-600"
                          : "bg-white/90 backdrop-blur-sm text-gray-700 hover:text-rose-500 hover:bg-white"
                      }`}
                      aria-label={
                        isWished ? "Remove from wishlist" : "Add to wishlist"
                      }
                    >
                      {isWished ? (
                        <HiHeart className="w-5 h-5" />
                      ) : (
                        <HiOutlineHeart className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {product.name}
                      </h3>
                      {product.color && (
                        <p className="mt-0.5 text-sm text-gray-500">
                          {product.color}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      €{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </p>
                  </div>

                  {/* Colors - only show if multiple unique colors exist */}
                  {(() => {
                    const uniqueColors = colors.filter((color, index, self) => 
                      index === self.findIndex(c => c.name === color.name)
                    );
                    return uniqueColors.length > 1;
                  })() && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {colors.filter((color, index, self) => 
                        index === self.findIndex(c => c.name === color.name)
                      ).map((c) => {
                        const isActive = chosenColor === c.name;
                        const textClass = textClassFor(c.hex);
                        return (
                          <div key={c.name} className="relative">
                            <button
                              onClick={() => setColor(product.id, c.name)}
                              className={`peer h-6 w-6 rounded-full border shadow-sm transition
                                ${isActive ? "scale-110 border-black" : "hover:scale-110 border-gray-300"}`}
                              style={{ backgroundColor: c.hex }}
                              aria-label={`Select color ${c.name}`}
                              title={c.name}
                            />
                            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-200 peer-hover:-translate-y-1 peer-hover:opacity-100">
                              <div
                                className={`whitespace-nowrap rounded px-2 py-0.5 text-xs shadow-md ${textClass}`}
                                style={{ backgroundColor: c.hex }}
                              >
                                {c.name}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sizes */}
                  {sizes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sizes.map((s) => {
                        const isActive = chosenSize === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setSize(product.id, s)}
                            className={`rounded-md border px-2.5 py-1 text-xs transition
                              ${
                                isActive
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "border-gray-300 bg-white text-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                              }`}
                            aria-pressed={isActive}
                            aria-label={`Select size ${s}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Add to cart */}
                  <button
                    onClick={() => handleAdd(product)}
                    className="group relative mt-4 w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-black to-gray-800 px-6 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-gray-800 hover:to-black transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-black/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative">Add to Cart</span>
                    <svg 
                      className="relative ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* Demo products removed to prevent fallback display */
export const demoProducts = [];
