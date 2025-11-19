import { NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '../../../lib/stripe'
import { prisma } from '../../../lib/prisma'

export async function POST(request) {
  try {
    const { userId, shippingDetails } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
      // Return mock success for development
      return NextResponse.json({ 
        url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout/success?session_id=mock_session_123`,
        message: 'Mock checkout session created (Stripe not configured)'
      })
    }

    // Get cart items for the user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Get product details for each cart item
    const cartItemsWithProducts = await Promise.all(cartItems.map(async item => {
      // Try to find by ID first, then by SKU if not found
      let product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      // If not found by ID, try finding by SKU
      if (!product) {
        product = await prisma.product.findUnique({
          where: { sku: item.productId }
        })
      }
      
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`)
      }
      
      return {
        ...item,
        product
      }
    }))

    // Calculate totals
    const subtotal = cartItemsWithProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    
    // Dynamic shipping cost based on method
    const getShippingCost = (method) => {
      switch (method) {
        case 'economy': return 3.50;
        case 'standard': return 5.00;
        case 'priority': return 7.50;
        case 'express': return 9.90;
        case 'overnight': return 19.90;
        case 'same-day': return 29.90;
        default: return 5.00;
      }
    };
    
    const shippingCost = getShippingCost(shippingDetails?.shippingMethod)
    const taxAmount = subtotal * 0.084 // 8.4% tax
    const total = subtotal + shippingCost + taxAmount

    // Create Stripe line items (only products)
    const lineItems = cartItemsWithProducts.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product.name,
          description: [item.colorName, item.size].filter(Boolean).join(' / ') || undefined,
          images: [item.product.imageSrc],
          metadata: {
            productId: item.product.id,
            colorName: item.colorName || '',
            size: item.size || '',
          }
        },
        unit_amount: formatAmountForStripe(item.product.price),
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'], // Enable both card and PayPal
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/?cart=open`,
      customer_email: shippingDetails?.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'GR', 'CY', 'NL', 'BE', 'AT'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 350, // €3.50
              currency: 'eur',
            },
            display_name: 'Economy Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 500, // €5.00
              currency: 'eur',
            },
            display_name: 'Standard Shipping (Most Popular)',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 2,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 990, // €9.90
              currency: 'eur',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1990, // €19.90
              currency: 'eur',
            },
            display_name: 'Overnight Delivery (Urgent)',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 1,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 2990, // €29.90
              currency: 'eur',
            },
            display_name: 'Same-Day Delivery (Premium)',
            delivery_estimate: {
              minimum: {
                unit: 'hour',
                value: 2,
              },
              maximum: {
                unit: 'hour',
                value: 8,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        shipping_address: {
          message: 'Please provide accurate delivery information to ensure smooth delivery.',
        },
        submit: {
          message: 'Your order will be processed within 24 hours. Thank you for shopping with us!',
        },
      },
      metadata: {
        userId,
        cartItemIds: cartItems.map(item => item.id).join(','),
        shippingMethod: shippingDetails?.shippingMethod || 'standard',
      },
      automatic_tax: {
        enabled: true, // Let Stripe handle tax calculation
      },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' }, 
      { status: 500 }
    )
  }
}