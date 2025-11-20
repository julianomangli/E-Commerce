import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Real-time visitor count (last hour)
    const realtimeVisitors = await prisma.visitorSession.count({
      where: {
        lastSeen: { gte: lastHour }
      }
    })

    // Today's statistics
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const [
      todaySessions,
      todayPageViews,
      todayEvents,
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      topProducts,
      recentOrders,
      visitorSessions
    ] = await Promise.all([
      // Today's sessions
      prisma.visitorSession.count({
        where: { firstSeen: { gte: todayStart } }
      }),
      
      // Today's page views
      prisma.visitorSession.aggregate({
        where: { lastSeen: { gte: todayStart } },
        _sum: { pageViews: true }
      }),
      
      // Today's events
      prisma.analyticsEvent.count({
        where: { timestamp: { gte: todayStart } }
      }),
      
      // Total orders
      prisma.order.count(),
      
      // Today's orders
      prisma.order.count({
        where: { createdAt: { gte: todayStart } }
      }),
      
      // Total revenue
      prisma.order.aggregate({
        where: { status: 'completed' },
        _sum: { total: true }
      }),
      
      // Today's revenue
      prisma.order.aggregate({
        where: { 
          status: 'completed',
          createdAt: { gte: todayStart }
        },
        _sum: { total: true }
      }),
      
      // Top products (last 30 days)
      prisma.analyticsEvent.groupBy({
        by: ['eventData'],
        where: {
          eventType: 'add_to_cart',
          timestamp: { gte: last30Days }
        },
        _count: true,
        orderBy: { _count: { eventType: 'desc' } },
        take: 5
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true
        }
      }),
      
      // Visitor sessions for geography
      prisma.visitorSession.findMany({
        where: { lastSeen: { gte: last24Hours } },
        take: 100,
        orderBy: { lastSeen: 'desc' }
      })
    ])

    // Calculate growth rates
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
    const yesterdaySessions = await prisma.visitorSession.count({
      where: { 
        firstSeen: { gte: yesterdayStart, lt: todayStart }
      }
    })

    const sessionGrowth = yesterdaySessions > 0 
      ? ((todaySessions - yesterdaySessions) / yesterdaySessions * 100)
      : 0

    // Geographic data (simplified)
    const geographicData = visitorSessions.reduce((acc, session) => {
      // Simple IP-to-location mapping (in production, use a service like MaxMind)
      const country = session.clientIP?.startsWith('192.168') ? 'Local' : 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      realtime: {
        visitorsNow: realtimeVisitors,
        currentTime: now.toISOString()
      },
      today: {
        sessions: todaySessions,
        pageViews: todayPageViews._sum?.pageViews || 0,
        events: todayEvents,
        orders: todayOrders,
        revenue: todayRevenue._sum?.total || 0,
        sessionGrowth: Math.round(sessionGrowth * 100) / 100
      },
      totals: {
        orders: totalOrders,
        revenue: totalRevenue._sum?.total || 0
      },
      topProducts: topProducts.map(product => ({
        productData: product.eventData,
        count: product._count
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        total: order.total,
        status: order.status,
        itemCount: order.items.length,
        createdAt: order.createdAt
      })),
      geographic: geographicData,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}