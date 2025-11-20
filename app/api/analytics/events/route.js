import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { eventType, data, sessionId, userId } = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        sessionId,
        userId,
        clientIP,
        userAgent,
        eventData: data || {},
        timestamp: new Date()
      }
    })

    // Update or create visitor session
    if (sessionId) {
      await prisma.visitorSession.upsert({
        where: { sessionId },
        update: {
          lastSeen: new Date(),
          pageViews: { increment: 1 }
        },
        create: {
          sessionId,
          userId,
          clientIP,
          userAgent,
          firstSeen: new Date(),
          lastSeen: new Date(),
          pageViews: 1
        }
      })
    }

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'
    const eventType = searchParams.get('eventType')

    const now = new Date()
    let startDate = new Date()

    // Set date range based on timeframe
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    // Build where clause
    const where = {
      timestamp: { gte: startDate, lte: now }
    }
    if (eventType) {
      where.eventType = eventType
    }

    // Get analytics data
    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000
    })

    // Get visitor sessions
    const sessions = await prisma.visitorSession.findMany({
      where: {
        lastSeen: { gte: startDate }
      }
    })

    // Calculate metrics
    const totalEvents = events.length
    const totalSessions = sessions.length
    const totalPageViews = sessions.reduce((sum, session) => sum + session.pageViews, 0)
    const uniqueVisitors = new Set(sessions.map(s => s.clientIP)).size

    // Event type breakdown
    const eventTypeBreakdown = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {})

    // Daily breakdown for charts
    const dailyStats = {}
    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0]
      if (!dailyStats[date]) {
        dailyStats[date] = { events: 0, sessions: 0, pageViews: 0 }
      }
      dailyStats[date].events++
    })

    sessions.forEach(session => {
      const date = session.firstSeen.toISOString().split('T')[0]
      if (dailyStats[date]) {
        dailyStats[date].sessions++
        dailyStats[date].pageViews += session.pageViews
      }
    })

    return NextResponse.json({
      summary: {
        totalEvents,
        totalSessions,
        totalPageViews,
        uniqueVisitors,
        timeframe
      },
      eventTypeBreakdown,
      dailyStats,
      recentEvents: events.slice(0, 50)
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}