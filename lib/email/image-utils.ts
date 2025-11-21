/**
 * Utilities for handling images in email templates
 */

/**
 * Convert relative URLs to absolute URLs for email compatibility
 */
export function makeImageUrlAbsolute(url: string): string {
  // Already a data URL (base64) - return as is
  if (url.startsWith('data:')) {
    return url
  }

  // Already an absolute URL - return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Relative URL - convert to absolute
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  return `${baseUrl}${cleanUrl}`
}

/**
 * Process HTML content to ensure all image URLs are email-compatible
 */
export function processEmailImages(html: string): string {
  // Replace all img src attributes
  return html.replace(
    /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
    (match, before, src, after) => {
      const absoluteSrc = makeImageUrlAbsolute(src)
      return `<img${before}src="${absoluteSrc}"${after}>`
    }
  )
}

/**
 * Check if an image URL is likely to work in emails
 */
export function validateEmailImageUrl(url: string): {
  valid: boolean
  reason?: string
  warning?: string
} {
  // Data URLs (base64)
  if (url.startsWith('data:')) {
    // Check size - emails have limits on data URLs
    const sizeMB = url.length / (1024 * 1024)
    if (sizeMB > 2) {
      return {
        valid: false,
        reason: `Image trop grande (${sizeMB.toFixed(1)}MB). Les data URLs base64 devraient faire moins de 2MB pour les emails.`
      }
    }
    if (sizeMB > 1) {
      return {
        valid: true,
        warning: `Image volumineuse (${sizeMB.toFixed(1)}MB). Certains clients email pourraient avoir des problèmes.`
      }
    }
    return { valid: true }
  }

  // Absolute URLs
  if (url.startsWith('https://')) {
    return { valid: true }
  }

  // HTTP (not recommended but works)
  if (url.startsWith('http://')) {
    return {
      valid: true,
      warning: 'URL HTTP non sécurisée. Préférez HTTPS pour une meilleure compatibilité.'
    }
  }

  // Relative URLs won't work in emails
  return {
    valid: false,
    reason: 'URL relative détectée. Les emails nécessitent des URLs absolues ou des data URLs.'
  }
}

/**
 * Extract all image URLs from HTML
 */
export function extractImageUrls(html: string): string[] {
  const urls: string[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
  let match

  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1])
  }

  return urls
}

/**
 * Validate all images in HTML content for email compatibility
 */
export function validateEmailImages(html: string): {
  valid: boolean
  totalImages: number
  issues: Array<{ url: string; issue: string }>
  warnings: Array<{ url: string; warning: string }>
} {
  const urls = extractImageUrls(html)
  const issues: Array<{ url: string; issue: string }> = []
  const warnings: Array<{ url: string; warning: string }> = []

  urls.forEach(url => {
    const validation = validateEmailImageUrl(url)
    if (!validation.valid && validation.reason) {
      issues.push({ url: url.substring(0, 100), issue: validation.reason })
    }
    if (validation.warning) {
      warnings.push({ url: url.substring(0, 100), warning: validation.warning })
    }
  })

  return {
    valid: issues.length === 0,
    totalImages: urls.length,
    issues,
    warnings
  }
}
