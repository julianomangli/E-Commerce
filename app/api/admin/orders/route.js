import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    // Build where clause
    const where = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          shippingAddress: true,
          billingAddress: true
        }
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore: page < totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json()

    const order = await prisma.order.create({
      data: {
        ...orderData,
        status: 'PENDING',
        orderNumber: `ORD-${Date.now()}`,
        items: {
          create: orderData.items
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Track order creation
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'order_created',
        eventData: {
          orderId: order.id,
          total: order.total,
          itemCount: order.items.length
        },
        timestamp: new Date()
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}