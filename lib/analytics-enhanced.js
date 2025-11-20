// Enhanced Analytics Library for E-commerce Tracking
class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.userId = this.getUserId()
    this.init()
  }

  init() {
    // Track page views automatically
    this.trackPageView()
    
    // Track user engagement
    this.trackUserEngagement()
    
    // Set up visibility change tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_blur', { 
          timeOnPage: this.getTimeOnPage() 
        })
      } else {
        this.trackEvent('page_focus', {})
      }
    })

    // Track session start
    this.trackEvent('session_start', {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height
      }
    })
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  getUserId() {
    let userId = localStorage.getItem('analytics_user_id')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('analytics_user_id', userId)
    }
    return userId
  }

  getTimeOnPage() {
    if (!this.pageStartTime) return 0
    return Date.now() - this.pageStartTime
  }

  trackEvent(eventType, data = {}) {
    const eventData = {
      eventType,
      data: {
        ...data,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        timeOnPage: this.getTimeOnPage()
      },
      sessionId: this.sessionId,
      userId: this.userId
    }

    // Send to analytics API
    this.sendEvent(eventData)
  }

  trackPageView(page = null) {
    this.pageStartTime = Date.now()
    const pageData = {
      page: page || window.location.pathname,
      title: document.title,
      referrer: document.referrer
    }
    
    this.trackEvent('page_view', pageData)
  }

  trackProductView(productId, productData = {}) {
    this.trackEvent('product_view', {
      productId,
      ...productData
    })
  }

  trackAddToCart(productId, productData = {}, price = 0) {
    this.trackEvent('add_to_cart', {
      productId,
      price,
      ...productData
    })
  }

  trackRemoveFromCart(productId, productData = {}) {
    this.trackEvent('remove_from_cart', {
      productId,
      ...productData
    })
  }

  trackAddToWishlist(productId, productData = {}) {
    this.trackEvent('add_to_wishlist', {
      productId,
      ...productData
    })
  }

  trackRemoveFromWishlist(productId, productData = {}) {
    this.trackEvent('remove_from_wishlist', {
      productId,
      ...productData
    })
  }

  trackCheckoutStart(cartData = {}) {
    this.trackEvent('checkout_start', {
      ...cartData,
      step: 'start'
    })
  }

  trackCheckoutComplete(orderData = {}) {
    this.trackEvent('checkout_complete', {
      ...orderData,
      step: 'complete'
    })
  }

  trackSearch(query, results = 0) {
    this.trackEvent('search', {
      query,
      results,
      searchTime: new Date().toISOString()
    })
  }

  trackPurchase(orderData = {}) {
    this.trackEvent('purchase', {
      ...orderData,
      purchaseTime: new Date().toISOString()
    })
  }

  trackUserEngagement() {
    let scrollDepth = 0
    let maxScrollDepth = 0
    
    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent
        
        // Track milestone scroll depths
        if (scrollPercent >= 25 && scrollDepth < 25) {
          this.trackEvent('scroll_depth', { depth: 25 })
          scrollDepth = 25
        } else if (scrollPercent >= 50 && scrollDepth < 50) {
          this.trackEvent('scroll_depth', { depth: 50 })
          scrollDepth = 50
        } else if (scrollPercent >= 75 && scrollDepth < 75) {
          this.trackEvent('scroll_depth', { depth: 75 })
          scrollDepth = 75
        } else if (scrollPercent >= 90 && scrollDepth < 90) {
          this.trackEvent('scroll_depth', { depth: 90 })
          scrollDepth = 90
        }
      }
    }

    // Throttle scroll events
    let scrollTimeout
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(trackScroll, 100)
    })

    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target
      const clickData = {
        element: target.tagName,
        classes: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 100),
        x: e.clientX,
        y: e.clientY
      }
      
      this.trackEvent('click', clickData)
    })
  }

  async sendEvent(eventData) {
    try {
      // Use navigator.sendBeacon if available for reliability
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(eventData)], {
          type: 'application/json'
        })
        navigator.sendBeacon('/api/analytics/events', blob)
      } else {
        // Fallback to fetch
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
          keepalive: true
        })
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
      
      // Queue failed events for retry
      const queuedEvents = JSON.parse(localStorage.getItem('analytics_queue') || '[]')
      queuedEvents.push(eventData)
      localStorage.setItem('analytics_queue', JSON.stringify(queuedEvents))
    }
  }

  // Retry queued events
  async retryQueuedEvents() {
    const queuedEvents = JSON.parse(localStorage.getItem('analytics_queue') || '[]')
    
    if (queuedEvents.length > 0) {
      for (const event of queuedEvents) {
        try {
          await this.sendEvent(event)
        } catch (error) {
          console.warn('Retry failed for event:', error)
          break // Stop retrying if still failing
        }
      }
      
      // Clear successfully sent events
      localStorage.removeItem('analytics_queue')
    }
  }

  // E-commerce specific tracking methods
  trackUserRegister(userData = {}) {
    this.trackEvent('user_register', userData)
  }

  trackUserLogin(userData = {}) {
    this.trackEvent('user_login', userData)
  }

  trackUserLogout() {
    this.trackEvent('user_logout', {})
  }

  // Real-time visitor tracking
  startRealtimeTracking() {
    // Send heartbeat every 30 seconds to indicate active session
    setInterval(() => {
      this.trackEvent('heartbeat', {
        activeTime: Date.now() - this.pageStartTime
      })
    }, 30000)
  }
}

// Initialize analytics
const analytics = new Analytics()

// Make available globally
window.analytics = analytics

// Start real-time tracking
analytics.startRealtimeTracking()

// Retry any queued events on page load
analytics.retryQueuedEvents()

export default analytics