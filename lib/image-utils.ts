/**
 * Image Utilities for Photo Cropping and Optimization
 *
 * Functions for cropping, resizing, and compressing images
 * Used in the badge photo upload system
 */

import { Area } from 'react-easy-crop'

/**
 * Create an image element from a URL
 */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

/**
 * Get radians from degrees
 */
export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180
}

/**
 * Calculate rotated size of image
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * Crop and rotate an image
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const rotRad = getRadianAngle(rotation)

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // Translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // Draw rotated image
  ctx.drawImage(image, 0, 0)

  // Create a new canvas for the cropped area
  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    throw new Error('Failed to get cropped canvas context')
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      },
      'image/jpeg',
      0.95
    )
  })
}

/**
 * Resize image to fit within max dimensions while maintaining aspect ratio
 */
export async function resizeImage(
  blob: Blob,
  maxWidth: number,
  maxHeight: number,
  quality = 0.9
): Promise<Blob> {
  const imageSrc = URL.createObjectURL(blob)
  const image = await createImage(imageSrc)

  // Calculate new dimensions
  let { width, height } = image

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Create canvas with new dimensions
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Draw resized image
  ctx.drawImage(image, 0, 0, width, height)

  // Clean up
  URL.revokeObjectURL(imageSrc)

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      },
      'image/jpeg',
      quality
    )
  })
}

/**
 * Process image: crop, resize, and optimize
 */
export async function processImage(
  imageSrc: string,
  croppedAreaPixels: Area,
  rotation: number,
  maxDimension = 1200,
  quality = 0.9
): Promise<{ blob: Blob; previewUrl: string; size: number }> {
  // 1. Crop the image
  const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)

  // 2. Resize if needed
  const resizedBlob = await resizeImage(croppedBlob, maxDimension, maxDimension, quality)

  // 3. Create preview URL
  const previewUrl = URL.createObjectURL(resizedBlob)

  return {
    blob: resizedBlob,
    previewUrl,
    size: resizedBlob.size,
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Aspect ratio presets for badges
 */
export const ASPECT_RATIO_PRESETS = {
  SQUARE: { value: 1, label: 'Carré (1:1)' },
  PORTRAIT: { value: 3 / 4, label: 'Portrait (3:4)' },
  LANDSCAPE: { value: 4 / 3, label: 'Paysage (4:3)' },
  BADGE_STANDARD: { value: 54 / 85.6, label: 'Badge Standard' },
  BADGE_LANYARD: { value: 100 / 150, label: 'Badge Lanyard (2:3)' },
} as const
