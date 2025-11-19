"use client"
import { useState, useEffect } from 'react'

export function PricingAnalytics({ products = [] }) {
  const [analytics, setAnalytics] = useState({
    averageProfit: 0,
    totalProducts: 0,
    profitRanges: {
      low: 0,    // €0-5
      medium: 0, // €5-8
      high: 0    // €8+
    },
    categoryBreakdown: {}
  })

  useEffect(() => {
    if (products.length === 0) return

    const validProducts = products.filter(p => p.yourTotalProfit !== undefined)
    
    const totalProfit = validProducts.reduce((sum, p) => sum + p.yourTotalProfit, 0)
    const averageProfit = validProducts.length > 0 ? totalProfit / validProducts.length : 0

    const profitRanges = {
      low: validProducts.filter(p => p.yourTotalProfit < 10).length,     // Less than €10 total
      medium: validProducts.filter(p => p.yourTotalProfit >= 10 && p.yourTotalProfit < 15).length,  // €10-15 total
      high: validProducts.filter(p => p.yourTotalProfit >= 15).length    // €15+ total
    }

    // Category breakdown
    const categoryBreakdown = {}
    validProducts.forEach(product => {
      const category = product.subcategory || 'Other'
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          count: 0,
          totalProfit: 0,
          avgProfit: 0,
          products: []
        }
      }
      categoryBreakdown[category].count++
      categoryBreakdown[category].totalProfit += product.yourTotalProfit
      categoryBreakdown[category].products.push(product)
    })

    // Calculate averages
    Object.keys(categoryBreakdown).forEach(category => {
      const data = categoryBreakdown[category]
      data.avgProfit = data.totalProfit / data.count
    })

    setAnalytics({
      averageProfit,
      totalProducts: validProducts.length,
      profitRanges,
      categoryBreakdown
    })
  }, [products])

  const getProfitColor = (profit) => {
    if (profit < 10) return 'text-red-600 bg-red-50'      // Less than €10 total
    if (profit < 15) return 'text-yellow-600 bg-yellow-50' // €10-15 total  
    return 'text-green-600 bg-green-50'                    // €15+ total
  }

  const getProfitBadge = (profit) => {
    if (profit < 10) return 'Low Total'
    if (profit < 15) return 'Good Total'
    return 'Excellent Total'
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Your Total Profit</div>
          <div className={`text-2xl font-bold ${getProfitColor(analytics.averageProfit)}`}>
            €{analytics.averageProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Includes €10 Printful earnings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Total Products</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">High Profit (€15+)</div>
          <div className="text-2xl font-bold text-green-600">{analytics.profitRanges.high}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Low Profit (<€10)</div>
          <div className="text-2xl font-bold text-red-600">{analytics.profitRanges.low}</div>
        </div>
      </div>

      {/* Profit Distribution */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profit Distribution</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Low Profit (€0-5)</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(analytics.profitRanges.low / analytics.totalProducts) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analytics.profitRanges.low}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Good Profit (€5-8)</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(analytics.profitRanges.medium / analytics.totalProducts) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analytics.profitRanges.medium}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Excellent Profit (€8+)</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(analytics.profitRanges.high / analytics.totalProducts) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analytics.profitRanges.high}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profit by Category</h3>
        <div className="space-y-3">
          {Object.entries(analytics.categoryBreakdown)
            .sort(([,a], [,b]) => b.avgProfit - a.avgProfit)
            .map(([category, data]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-gray-900">{category}</div>
                <div className="text-sm text-gray-500">{data.count} products</div>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProfitColor(data.avgProfit)}`}>
                  €{data.avgProfit.toFixed(2)} avg
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {getProfitBadge(data.avgProfit)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-4">💡 Profit Optimization Tips</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {analytics.profitRanges.low > 0 && (
            <div>• Consider increasing prices on {analytics.profitRanges.low} low-profit products</div>
          )}
          {analytics.averageProfit < 6 && (
            <div>• Your average profit is below €6 - consider reviewing your pricing strategy</div>
          )}
          {analytics.profitRanges.high > analytics.profitRanges.medium && (
            <div>• Great! You have more high-profit products than medium-profit ones</div>
          )}
          <div>• Focus on promoting categories with highest profit margins</div>
          <div>• Consider bundling low-profit items with high-profit accessories</div>
        </div>
      </div>
    </div>
  )
}