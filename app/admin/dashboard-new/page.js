'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
)

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// Main Dashboard Component
function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
    fetchAnalytics()
    
    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Refresh dashboard data every 30 seconds
    const dataInterval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
  }, [timeframe])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/events?timeframe=${timeframe}`)
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_login_time')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📊 Admin Dashboard</h1>
              <div className="ml-6 flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live Data
                </div>
                <span className="text-sm text-gray-500">
                  {currentTime.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timeframe Selector */}
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                🛍️ Products
              </button>
              
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: '📊 Overview', icon: '📊' },
              { id: 'analytics', name: '📈 Analytics', icon: '📈' },
              { id: 'orders', name: '📦 Orders', icon: '📦' },
              { id: 'customers', name: '👥 Customers', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${ 
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab dashboardData={dashboardData} analyticsData={analyticsData} />}
        {activeTab === 'analytics' && <AnalyticsTab analyticsData={analyticsData} timeframe={timeframe} />}
        {activeTab === 'orders' && <OrdersTab dashboardData={dashboardData} />}
        {activeTab === 'customers' && <CustomersTab dashboardData={dashboardData} />}
      </main>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ dashboardData, analyticsData }) {
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Real-time Visitors */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Visitors Now</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.realtime?.visitorsNow || 0}
                </p>
                <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">📈</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Sessions Today</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.today?.sessions || 0}
                </p>
                {dashboardData?.today?.sessionGrowth !== undefined && (
                  <span className={`ml-2 text-sm font-medium ${
                    dashboardData.today.sessionGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardData.today.sessionGrowth >= 0 ? '↗' : '↘'} 
                    {Math.abs(dashboardData.today.sessionGrowth).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-bold text-gray-900">
                €{(dashboardData?.today?.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">📦</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.totals?.orders || 0}
                </p>
                <span className="ml-2 text-sm text-green-600">
                  +{dashboardData?.today?.orders || 0} today
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Trend</h3>
          {analyticsData?.dailyStats && (
            <div className="h-64">
              <Line
                data={{
                  labels: Object.keys(analyticsData.dailyStats).slice(-7),
                  datasets: [
                    {
                      label: 'Page Views',
                      data: Object.values(analyticsData.dailyStats).slice(-7).map(d => d.pageViews),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: 'Sessions',
                      data: Object.values(analyticsData.dailyStats).slice(-7).map(d => d.sessions),
                      borderColor: 'rgb(16, 185, 129)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      fill: true,
                      tension: 0.4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* User Activity Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
          {analyticsData?.eventTypeBreakdown && (
            <div className="h-64">
              <Doughnut
                data={{
                  labels: Object.keys(analyticsData.eventTypeBreakdown),
                  datasets: [{
                    data: Object.values(analyticsData.eventTypeBreakdown),
                    backgroundColor: [
                      'rgb(59, 130, 246)',
                      'rgb(16, 185, 129)',
                      'rgb(245, 158, 11)',
                      'rgb(239, 68, 68)',
                      'rgb(139, 92, 246)',
                      'rgb(236, 72, 153)'
                    ],
                    borderWidth: 2,
                    borderColor: 'white'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
          </div>
          <div className="p-6">
            {dashboardData?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {product.productData?.name || 'Unknown Product'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{product.count} sales</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No sales data available</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {dashboardData?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Order #{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {order.itemCount} items • {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">€{order.total.toFixed(2)}</div>
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Analytics Tab Component  
function AnalyticsTab({ analyticsData, timeframe }) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
        
        {analyticsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{analyticsData.summary.totalEvents}</div>
              <div className="text-sm text-gray-500">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analyticsData.summary.totalSessions}</div>
              <div className="text-sm text-gray-500">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analyticsData.summary.totalPageViews}</div>
              <div className="text-sm text-gray-500">Page Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{analyticsData.summary.uniqueVisitors}</div>
              <div className="text-sm text-gray-500">Unique Visitors</div>
            </div>
          </div>
        )}

        {analyticsData?.recentEvents && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.recentEvents.slice(0, 10).map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.eventType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.sessionId?.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.clientIP}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Orders Tab Component
function OrdersTab({ dashboardData }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h2>
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management</h3>
        <p className="text-gray-500 mb-6">
          Advanced order management features will be available soon.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{dashboardData?.totals?.orders || 0}</div>
            <div className="text-sm text-gray-500">Total Orders</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dashboardData?.today?.orders || 0}</div>
            <div className="text-sm text-gray-500">Today's Orders</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">€{(dashboardData?.today?.revenue || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-500">Revenue Today</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Customers Tab Component
function CustomersTab({ dashboardData }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h2>
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Analytics</h3>
        <p className="text-gray-500 mb-6">
          Comprehensive customer management and analytics coming soon.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{dashboardData?.today?.sessions || 0}</div>
            <div className="text-sm text-gray-500">Sessions Today</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dashboardData?.realtime?.visitorsNow || 0}</div>
            <div className="text-sm text-gray-500">Visitors Now</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(AdminDashboard)