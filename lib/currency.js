// Currency formatting utilities for Euro display

export function formatEuro(amount) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `€${numAmount.toFixed(2)}`;
}

export function formatEuroShort(amount) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `€${numAmount.toFixed(0)}`;
}

export function parseEuroString(euroString) {
  if (typeof euroString === 'number') return euroString;
  return parseFloat(euroString.replace('€', '').replace(',', '.'));
}

// Convert USD to EUR (approximate rate)
export function usdToEur(usdAmount) {
  const rate = 0.85; // Approximate conversion rate
  return usdAmount * rate;
}

// Stripe uses cents, so convert euros to cents
export function eurosToCents(euros) {
  return Math.round(euros * 100);
}

// Convert cents back to euros
export function centsToEuros(cents) {
  return cents / 100;
}