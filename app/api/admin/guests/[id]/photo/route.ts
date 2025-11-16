/**
 * API Route: Guest Photo Upload/Delete
 *
 * POST /api/admin/guests/[id]/photo - Upload photo to Vercel Blob
 * DELETE /api/admin/guests/[id]/photo - Delete photo from Vercel Blob
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'
import { createLogger } from '@/lib/logger'

const logger = createLogger({ module: 'api', type: 'guest-photo' })

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * POST - Upload guest photo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const guestId = params.id

    // Verify guest exists
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { id: true, photoUrl: true },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('photo') as File

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

    // Delete old photo if exists
    if (guest.photoUrl) {
      try {
        await del(guest.photoUrl)
        logger.info('Deleted old photo', { guestId, oldUrl: guest.photoUrl })
      } catch (error) {
        logger.warn('Failed to delete old photo', { error, guestId })
      }
    }

    // Upload to Vercel Blob
    const fileName = `guest-photos/${guestId}-${Date.now()}.${file.type.split('/')[1]}`
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    logger.info('Uploaded photo to Blob', { guestId, url: blob.url })

    // Update guest record
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        photoUrl: blob.url,
        photoUploadedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        photoUploadedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      photo: {
        url: updatedGuest.photoUrl,
        uploadedAt: updatedGuest.photoUploadedAt,
      },
      guest: updatedGuest,
    })
  } catch (error) {
    logger.error(error, { action: 'uploadPhoto', metadata: { guestId: params.id } })
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove guest photo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const guestId = params.id

    // Get guest with photo URL
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { id: true, photoUrl: true },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    if (!guest.photoUrl) {
      return NextResponse.json(
        { error: 'No photo to delete' },
        { status: 400 }
      )
    }

    // Delete from Vercel Blob
    try {
      await del(guest.photoUrl)
      logger.info('Deleted photo from Blob', { guestId, url: guest.photoUrl })
    } catch (error) {
      logger.error(error, { action: 'deletePhotoFromBlob', metadata: { guestId, url: guest.photoUrl } })
      // Continue even if blob deletion fails
    }

    // Update guest record
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        photoUrl: null,
        photoUploadedAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    })
  } catch (error) {
    logger.error(error, { action: 'deletePhoto', metadata: { guestId: params.id } })
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
