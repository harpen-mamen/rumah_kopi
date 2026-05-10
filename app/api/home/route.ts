import { NextResponse } from 'next/server'
import { backendBaseUrl, fallbackHome } from '@/lib/public-content'

export async function GET() {
  try {
    const res = await fetch(`${backendBaseUrl()}/home`, { cache: 'no-store' })

    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend API tidak tersedia'
    return NextResponse.json({ success: false, message, data: fallbackHome }, { status: 200 })
  }
}
