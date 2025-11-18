/**
 * API Route: Generic Image Upload
 *
 * POST /api/admin/upload-image - Upload image to Vercel Blob
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { put } from '@vercel/blob'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'api', type: 'upload-image' })

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

/**
 * POST - Upload generic image
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

    // Upload to Vercel Blob
    const fileExtension = file.type.split('/')[1]
    const fileName = `event-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`

    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    logger.info({ url: blob.url, fileName }, 'Uploaded image to Blob')

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: fileName,
    })
  } catch (error) {
    logger.error({ error, action: 'uploadImage' }, 'Error uploading image')
    return handleAuthError(error)
  }
}
