import { NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { prisma } from '../../../../lib/prisma'

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret'
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        // Extract metadata
        const userId = session.metadata.userId
        const cartItemIds = session.metadata.cartItemIds?.split(',') || []
        const shippingMethod = session.metadata.shippingMethod

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        // Get cart items to create order
        const cartItems = await prisma.cartItem.findMany({
          where: {
            id: { in: cartItemIds },
            userId: userId
          },
          include: { product: true }
        })

        if (cartItems.length === 0) {
          console.error('No cart items found for session')
          break
        }

        // Calculate amounts
        const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        const shippingCost = shippingMethod === 'express' ? 9.90 : 5.00
        const taxAmount = subtotal * 0.084

        // Create order in database
        const order = await prisma.order.create({
          data: {
            userId: userId,
            orderNumber: `ORD-${Date.now()}`,
            status: 'CONFIRMED',
            totalAmount: session.amount_total / 100, // Convert from cents
            
            // Shipping details from Stripe
            shippingFirstName: session.shipping?.name?.split(' ')[0] || 'Customer',
            shippingLastName: session.shipping?.name?.split(' ').slice(1).join(' ') || '',
            shippingAddress1: session.shipping?.address?.line1 || '',
            shippingAddress2: session.shipping?.address?.line2 || '',
            shippingCity: session.shipping?.address?.city || '',
            shippingRegion: session.shipping?.address?.state || '',
            shippingPostalCode: session.shipping?.address?.postal_code || '',
            shippingCountry: session.shipping?.address?.country || '',
            
            shippingMethod: shippingMethod,
            shippingCost: shippingCost,
            taxAmount: taxAmount,
            billingSameAsShipping: true,
            
            // Create order items
            orderItems: {
              create: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
                colorName: item.colorName,
                size: item.size,
              }))
            }
          },
          include: {
            orderItems: true
          }
        })

        // Clear the cart items
        await prisma.cartItem.deleteMany({
          where: {
            id: { in: cartItemIds }
          }
        })

        console.log(`✅ Order created: ${order.orderNumber}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}