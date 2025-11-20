import './globals.css'
import { CartProvider } from '../contexts/CartContext'
import { WishlistProvider } from '../contexts/WishlistContext'
import { Analytics } from '@vercel/analytics/react'

export const metadata = {
  title: 'Mangli Website',
  description: 'Discover curated collections of premium clothing and accessories. Shop minimalist essentials, modern classics, and trending fashion pieces.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <WishlistProvider>
            {children}
            <Analytics />
          </WishlistProvider>
        </CartProvider>
        {/* Analytics Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize enhanced analytics
              (function() {
                if (typeof window !== 'undefined') {
                  import('/lib/analytics-enhanced.js');
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}