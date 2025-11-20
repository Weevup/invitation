/**
 * API Route: Generic Image Upload
 *
 * POST /api/admin/upload-image - Convert image to base64 data URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'api', type: 'upload-image' })

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (reduced for base64 storage)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

/**
 * POST - Upload generic image (converts to base64)
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    await requireAdmin()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    logger.info({
      fileType: file.type,
      fileSize: file.size,
      base64Length: dataUrl.length
    }, 'Converted image to base64')

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
    })
  } catch (error) {
    logger.error({ error, action: 'uploadImage' }, 'Error uploading image')
    return handleAuthError(error)
  }
}
