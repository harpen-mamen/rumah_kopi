import { NextRequest, NextResponse } from 'next/server'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

function getPassword(req?: NextRequest): string {
  // Parola custom din cookie override, sau cea din env var
  if (req) {
    const override = req.cookies.get('admin_password_override')?.value
    if (override) return override
  }
  return process.env.ADMIN_PASSWORD || 'admin'
}

// POST — login
export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correctPassword = getPassword(req)

  if (password !== correctPassword) {
    return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_auth', 'true', { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 8 })
  return res
}

// PUT — schimbă parola
export async function PUT(req: NextRequest) {
  const { currentPassword, newPassword } = await req.json()
  const correctPassword = getPassword(req)

  if (currentPassword !== correctPassword) {
    return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 401 })
  }

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ success: false, message: 'New password must be at least 4 characters.' }, { status: 400 })
  }

  const res = NextResponse.json({ success: true })
  // Salvează noua parolă în cookie securizat (30 zile)
  res.cookies.set('admin_password_override', newPassword, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 })
  return res
}

// DELETE — logout
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_auth')
  return res
}
