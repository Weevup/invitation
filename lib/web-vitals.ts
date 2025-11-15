/**
 * Web Vitals Monitoring
 *
 * Tracks Core Web Vitals and sends them to monitoring services
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response time
 * - INP (Interaction to Next Paint): Responsiveness
 */

import type { Metric } from 'web-vitals'

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals'

function getConnectionSpeed(): string {
  if (
    'connection' in navigator &&
    navigator.connection &&
    typeof navigator.connection === 'object' &&
    'effectiveType' in navigator.connection
  ) {
    return (navigator.connection as any).effectiveType
  }
  return ''
}

/**
 * Send Web Vitals to analytics endpoint
 */
export function sendToAnalytics(metric: Metric) {
  const analyticsId = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID

  // Skip if analytics is not configured
  if (!analyticsId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric.name, metric.value, metric.rating)
    }
    return
  }

  const body = {
    dsn: analyticsId,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob)
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    })
  }
}

/**
 * Send Web Vitals to Sentry
 */
export function sendToSentry(metric: Metric) {
  // Only send to Sentry in production
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry

    // Create a measurement for each metric
    Sentry.metrics?.increment(`web-vitals.${metric.name.toLowerCase()}`, 1, {
      tags: {
        rating: metric.rating,
        page: window.location.pathname,
      },
    })

    // Also capture as breadcrumb for context
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value} (${metric.rating})`,
      level: metric.rating === 'good' ? 'info' : metric.rating === 'needs-improvement' ? 'warning' : 'error',
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      },
    })
  }
}

/**
 * Main Web Vitals reporter
 * Sends metrics to both Vercel Analytics and Sentry
 */
export function reportWebVitals(metric: Metric) {
  // Send to analytics
  sendToAnalytics(metric)

  // Send to Sentry
  sendToSentry(metric)

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const { name, value, rating, delta } = metric
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(value),
      rating,
      delta: Math.round(delta),
    })
  }
}
