/**
 * API Route: Template Debug
 * GET /api/admin/templates/[id]/debug - Debug template content
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'api', type: 'template-debug' })

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Parse blocks if available
    let blocks = null
    let imageBlocks: any[] = []
    let hasImages = false
    let imageStats: any[] = []

    if (template.blocksJson) {
      try {
        const parsed = JSON.parse(template.blocksJson)
        blocks = parsed.blocks || []

        // Find all image blocks
        imageBlocks = blocks.filter((b: any) =>
          b.type === 'image' ||
          (b.type === 'header' && (b.content.logoUrl || b.content.backgroundImage))
        )

        hasImages = imageBlocks.length > 0

        // Get stats for each image
        imageStats = imageBlocks.map((block: any) => {
          const urls: string[] = []

          if (block.type === 'image') {
            urls.push(block.content.url)
          }
          if (block.type === 'header') {
            if (block.content.logoUrl) urls.push(block.content.logoUrl)
            if (block.content.backgroundImage) urls.push(block.content.backgroundImage)
          }

          return urls.map(url => ({
            blockId: block.id,
            blockType: block.type,
            url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
            isDataUrl: url.startsWith('data:'),
            isAbsoluteUrl: url.startsWith('http://') || url.startsWith('https://'),
            isRelativeUrl: !url.startsWith('data:') && !url.startsWith('http'),
            length: url.length,
            estimatedSize: Math.round(url.length / 1024) + ' KB'
          }))
        }).flat()
      } catch (e) {
        logger.error(e, { action: 'parseBlocks' })
      }
    }

    // Check HTML for images
    const htmlImages: string[] = []
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g
    let match
    while ((match = imgRegex.exec(template.htmlContent)) !== null) {
      htmlImages.push(match[1].substring(0, 100) + (match[1].length > 100 ? '...' : ''))
    }

    return NextResponse.json({
      templateId: template.id,
      templateName: template.name,
      hasBlocksJson: !!template.blocksJson,
      totalBlocks: blocks ? blocks.length : 0,
      imageBlocksCount: imageBlocks.length,
      hasImages,
      imageStats,
      htmlImagesCount: htmlImages.length,
      htmlImages: htmlImages.slice(0, 5), // First 5
      htmlContentLength: template.htmlContent.length,
      lastUsedAt: template.lastUsedAt,
      usageCount: template.usageCount,
      isActive: template.isActive
    })
  } catch (error) {
    logger.error({ error }, 'Error debugging template')
    return handleAuthError(error)
  }
}
