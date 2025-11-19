'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SearchModal({ open, onClose, products = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      if (filtered.length > 0 && !selectedProduct) {
        setSelectedProduct(filtered[0]);
      }
    } else {
      setFilteredProducts([]);
      setSelectedProduct(null);
    }
  }, [searchQuery, products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    
    const updated = [
      product,
      ...recentSearches.filter(p => p.id !== product.id)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleClose = () => {
    setSearchQuery('');
    setFilteredProducts([]);
    setSelectedProduct(null);
    onClose();
  };

  const displayProducts = searchQuery.trim() ? filteredProducts : recentSearches;

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 ease-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel
          transition
          className="mx-auto max-w-4xl transform overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-gray-200 backdrop-blur-xl transition-all duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          {/* Search Input */}
          <div className="relative border-b border-gray-200">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="text"
              className="h-14 w-full border-0 bg-transparent pl-11 pr-11 text-white placeholder:text-gray-500 focus:ring-0 sm:text-sm"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleClose}
              className="absolute right-4 top-3.5 text-gray-500 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex min-h-[400px] max-h-[600px]">
            {/* Left Side - Recent Searches / Search Results */}
            <div className="w-1/2 overflow-y-auto border-r border-gray-200 p-4">
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {searchQuery.trim() ? 'Search Results' : 'Recent Searches'}
              </h3>
              
              {displayProducts.length > 0 ? (
                <ul className="space-y-1">
                  {displayProducts.map((product) => (
                    <li key={product.id}>
                      <button
                        onClick={() => handleProductClick(product)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition ${
                          selectedProduct?.id === product.id
                            ? 'bg-gray-100 text-black'
                            : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                        }`}
                      >
                        <img
                          src={product.imageSrc}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.price}</p>
                        </div>
                        <svg
                          className="h-4 w-4 shrink-0 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-gray-600">
                    {searchQuery.trim() ? 'No products found' : 'No recent searches'}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Product Details */}
            <div className="w-1/2 overflow-y-auto p-6">
              {selectedProduct ? (
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 w-40 h-40 rounded-full overflow-hidden ring-4 ring-gray-200">
                    <img
                      src={selectedProduct.imageSrc}
                      alt={selectedProduct.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <h2 className="mb-2 text-2xl font-bold text-white">
                    {selectedProduct.name}
                  </h2>
                  
                  {selectedProduct.color && (
                    <p className="mb-6 text-sm text-gray-500">
                      {selectedProduct.color}
                    </p>
                  )}

                  <div className="w-full space-y-3 text-sm">
                    {selectedProduct.price && (
                      <div className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3">
                        <span className="font-medium text-gray-600">Price</span>
                        <span className="font-semibold text-black">{selectedProduct.price}</span>
                      </div>
                    )}
                    
                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                      <div className="rounded-lg bg-gray-100 px-4 py-3">
                        <div className="mb-2 font-medium text-gray-600">Available Sizes</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {selectedProduct.sizes.map((size) => (
                            <span
                              key={size}
                              className="rounded-md bg-white px-3 py-1 text-xs font-medium text-black border border-gray-300"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                      <div className="rounded-lg bg-gray-100 px-4 py-3">
                        <div className="mb-2 font-medium text-gray-600">Available Colors</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {selectedProduct.colors.map((color) => (
                            <span
                              key={color}
                              className="rounded-md bg-white px-3 py-1 text-xs font-medium text-black capitalize border border-gray-300"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleClose();
                      window.location.href = `/product/${selectedProduct.id}`;
                    }}
                    className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800"
                  >
                    View Product
                  </button>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-600">
                    Select a product to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
