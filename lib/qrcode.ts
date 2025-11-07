import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export function getCheckinUrl(qrCodeId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/api/checkin/${qrCodeId}`
}
