'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'
import { reportWebVitals } from '@/lib/web-vitals'

/**
 * Web Vitals Reporter Component
 *
 * This component uses Next.js's useReportWebVitals hook to track
 * Core Web Vitals and send them to monitoring services.
 *
 * Add this component to your root layout to enable tracking.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric)
  })

  // Additional client-side performance monitoring
  useEffect(() => {
    // Report long tasks (tasks that block the main thread for > 50ms)
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // Log long tasks in development
              if (process.env.NODE_ENV === 'development') {
                console.warn('[Performance] Long task detected:', {
                  duration: Math.round(entry.duration),
                  startTime: Math.round(entry.startTime),
                })
              }

              // Send to Sentry in production
              if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
                const Sentry = (window as any).Sentry
                if (Sentry) {
                  Sentry.addBreadcrumb({
                    category: 'performance',
                    message: 'Long task detected',
                    level: 'warning',
                    data: {
                      duration: entry.duration,
                      startTime: entry.startTime,
                    },
                  })
                }
              }
            }
          }
        })

        longTaskObserver.observe({ entryTypes: ['longtask'] })

        return () => {
          longTaskObserver.disconnect()
        }
      } catch (e) {
        // Long task observer not supported, silently fail
      }
    }
  }, [])

  return null
}
