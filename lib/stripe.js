import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const formatAmountForStripe = (amount, currency = 'eur') => {
  // Stripe expects amounts in the smallest currency unit (cents for EUR)
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount, currency = 'eur') => {
  // Convert from cents back to euros
  return amount / 100
}