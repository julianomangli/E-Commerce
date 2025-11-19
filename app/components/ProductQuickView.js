"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";

/** Utilities **/
function parseColor(input) {
  if (typeof input === "object" && input && ("name" in input || "hex" in input)) {
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
    const full = c.length === 3 ? c.split("").map(ch => ch + ch).join("") : c;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "text-gray-900" : "text-white";
  } catch {
    return "text-white";
  }
}

export default function ProductQuickView({
  open,
  onClose,
  product,
  onAddToCart,              // (product, { colorName?, size? })
  autoSelectFirstVariant = false,
}) {
  const colorOptions = useMemo(
    () => (Array.isArray(product?.colors) ? product.colors.map(parseColor) : []),
    [product]
  );
  const sizeOptions = useMemo(
    () => (Array.isArray(product?.sizes) ? product.sizes : []),
    [product]
  );

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [flashColor, setFlashColor] = useState(false);
  const [flashSize, setFlashSize] = useState(false);
  const [helper, setHelper] = useState("");

  const requiresColor = colorOptions.length > 0;
  const requiresSize = sizeOptions.length > 0;

  useEffect(() => {
    if (!product) return;
    setSelectedColor(null);
    setSelectedSize(null);
    setHelper("");
    setFlashColor(false);
    setFlashSize(false);
    if (autoSelectFirstVariant) {
      if (requiresColor) setSelectedColor(colorOptions[0]?.name ?? null);
      if (requiresSize) setSelectedSize(sizeOptions[0] ?? null);
    }
  }, [product, autoSelectFirstVariant, requiresColor, requiresSize, colorOptions, sizeOptions]);

  const canAdd =
    (!requiresColor || !!selectedColor) &&
    (!requiresSize || !!selectedSize) &&
    product;

  const nudge = (missColor, missSize) => {
    setHelper(
      missColor && missSize
        ? "Choose a color and a size to add to cart."
        : missColor
        ? "Choose a color to add to cart."
        : "Choose a size to add to cart."
    );
    if (missColor) {
      setFlashColor(true);
      setTimeout(() => setFlashColor(false), 1200);
    }
    if (missSize) {
      setFlashSize(true);
      setTimeout(() => setFlashSize(false), 1200);
    }
  };

  const handleAdd = async () => {
    if (!canAdd) {
      nudge(requiresColor && !selectedColor, requiresSize && !selectedSize);
      return;
    }
    try {
      await onAddToCart?.(product, { colorName: selectedColor ?? null, size: selectedSize ?? null });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!product) return null;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay (symmetric enter/leave) */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-2 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-out duration-300"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-2 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all">
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                  {/* Image */}
                  <div className="overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={product.imageSrc}
                      alt={product.imageAlt || product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-bold text-gray-900">
                        {product.name}
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="text-2xl leading-none text-gray-500 hover:text-gray-800"
                        aria-label="Close quick view"
                      >
                        ×
                      </button>
                    </div>

                    <p className="mt-2 text-lg font-semibold text-gray-700">
                      {product.price}
                    </p>

                    {/* Colors */}
                    {requiresColor && (
                      <div className={`mt-5 rounded-md ${flashColor ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-white" : ""}`}>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          Color {selectedColor ? <span className="text-gray-500">• {selectedColor}</span> : null}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {colorOptions.map((c) => {
                            const isActive = selectedColor === c.name;
                            const textClass = textClassFor(c.hex);
                            return (
                              <div key={c.name} className="relative">
                                <button
                                  type="button"
                                  onClick={() => setSelectedColor(c.name)}
                                  className={`peer h-8 w-8 rounded-full border shadow-sm transition
                                    ${isActive ? "scale-110 border-black" : "hover:scale-110 border-gray-300"}`}
                                  style={{ backgroundColor: c.hex }}
                                  aria-label={`Select color ${c.name}`}
                                />
                                {/* hover-only tooltip */}
                                <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-200 peer-hover:-translate-y-1 peer-hover:opacity-100">
                                  <div
                                    className={`whitespace-nowrap rounded-md px-2 py-1 text-xs shadow-md ${textClass}`}
                                    style={{ backgroundColor: c.hex }}
                                  >
                                    {c.name}
                                  </div>
                                  <div
                                    className="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {requiresSize && (
                      <div className={`mt-6 rounded-md ${flashSize ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-white" : ""}`}>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          Size {selectedSize ? <span className="text-gray-500">• {selectedSize}</span> : null}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {sizeOptions.map((size) => {
                            const isActive = selectedSize === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={`rounded-md border px-3 py-1.5 text-sm transition
                                  ${isActive
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-300 bg-white text-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white"}`}
                                aria-pressed={isActive}
                                aria-label={`Select size ${size}`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Helper line (if missing selections after click) */}
                    {helper && (
                      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        {helper}
                      </p>
                    )}

                    {/* CTA always active */}
                    <button
                      className="group relative mt-6 w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-black to-gray-800 px-6 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:from-gray-800 hover:to-black transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-black/20 overflow-hidden"
                      onClick={handleAdd}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative">Add to Cart</span>
                      <svg 
                        className="relative ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
