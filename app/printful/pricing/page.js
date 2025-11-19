"use client"
import { useState, useEffect } from 'react'

export default function PricingConfigPage() {
  const [config, setConfig] = useState({
    minProfitMargin: 5.0,
    maxProfitMargin: 10.0,
    profitPercentage: 0.4,
    shippingBuffer: 2.0,
    premiumCategories: {
      'hoodies': 8.0,
      'jackets': 10.0,
      'bags': 7.0
    }
  })
  
  const [saved, setSaved] = useState(false)

  const updateConfig = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
    setSaved(false)
  }

  const updatePremiumCategory = (category, value) => {
    setConfig(prev => ({
      ...prev,
      premiumCategories: {
        ...prev.premiumCategories,
        [category]: parseFloat(value) || 0
      }
    }))
    setSaved(false)
  }

  const addPremiumCategory = () => {
    const category = prompt('Enter category name (e.g., "t-shirts", "mugs"):')
    if (category) {
      setConfig(prev => ({
        ...prev,
        premiumCategories: {
          ...prev.premiumCategories,
          [category.toLowerCase()]: 6.0
        }
      }))
      setSaved(false)
    }
  }

  const removePremiumCategory = (category) => {
    setConfig(prev => {
      const newCategories = { ...prev.premiumCategories }
      delete newCategories[category]
      return {
        ...prev,
        premiumCategories: newCategories
      }
    })
    setSaved(false)
  }

  const saveConfig = async () => {
    try {
      // In a real app, you would save this to your backend/database
      localStorage.setItem('printfulPricingConfig', JSON.stringify(config))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  useEffect(() => {
    // Load saved config on mount
    try {
      const savedConfig = localStorage.getItem('printfulPricingConfig')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }, [])

  const calculateExamplePrice = (printfulCost) => {
    const totalCost = printfulCost + config.shippingBuffer
    const percentagePrice = totalCost * (1 + config.profitPercentage)
    const targetPrice = totalCost + config.minProfitMargin
    const optimalPrice = Math.min(
      Math.max(percentagePrice, targetPrice),
      totalCost + config.maxProfitMargin
    )
    return Math.ceil(optimalPrice) - 0.01
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Configuration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure your profit margins and pricing strategy for Printful products
          </p>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-green-800">✅ Configuration saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Profit Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profit Margins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Profit (€)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.minProfitMargin}
                  onChange={(e) => updateConfig('minProfitMargin', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum profit per product</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Profit (€)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.maxProfitMargin}
                  onChange={(e) => updateConfig('maxProfitMargin', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum profit cap per product</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={config.profitPercentage}
                  onChange={(e) => updateConfig('profitPercentage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage markup (0.4 = 40%)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Buffer (€)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.shippingBuffer}
                  onChange={(e) => updateConfig('shippingBuffer', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Buffer for shipping costs</p>
              </div>
            </div>
          </div>

          {/* Premium Categories */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Premium Categories</h2>
              <button
                onClick={addPremiumCategory}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Add Category
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(config.premiumCategories).map(([category, profit]) => (
                <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {category}
                    </label>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={profit}
                      onChange={(e) => updatePremiumCategory(category, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500">€</div>
                  <button
                    onClick={() => removePremiumCategory(category)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Examples */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[8.25, 11.75, 15.50].map(printfulCost => {
                const retailPrice = calculateExamplePrice(printfulCost)
                const profit = retailPrice - printfulCost - config.shippingBuffer
                return (
                  <div key={printfulCost} className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">Printful Cost: €{printfulCost}</div>
                    <div className="text-lg font-semibold text-gray-900">Retail: €{retailPrice}</div>
                    <div className={`text-sm font-medium ${
                      profit >= 8 ? 'text-green-600' :
                      profit >= 5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      Profit: €{profit.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}