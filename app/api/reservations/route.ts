import { NextRequest, NextResponse } from 'next/server'
import { execute, query, type ReservationRow } from '@/lib/db'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const ADMIN_EMAIL = 'nicu.nickname@gmail.com'
const FROM = 'Cafe Tortuga <onboarding@resend.dev>'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

async function sendToClient(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `Cafe Tortuga <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, guests, date, time } = body

  if (!name || !email || !phone || !guests || !date || !time) {
    return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 })
  }

  try {
    await execute(
      'insert into reservations (name, email, phone, guests, date, time) values (:name, :email, :phone, :guests, :date, :time)',
      { name, email, phone, guests: Number(guests), date, time },
    )
  } catch (error) {
    console.error('MySQL insert error:', error)
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }

  // Email multumire client (non-blocking — rezervarea e salvată chiar dacă emailul pică)
  try { await sendToClient(email, '☕ Thank you for your reservation — Cafe Tortuga', `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
      <h2 style="color:#111827;margin-bottom:4px;">Thank you, ${name}! ☕</h2>
      <p style="color:#374151;margin-bottom:20px;">We've received your reservation request at <strong>Cafe Tortuga</strong>. We're reviewing it and you'll receive a confirmation email shortly.</p>
      <div style="background:white;border-radius:10px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">📅 <strong style="color:#111827;">${formatDate(date)}</strong></p>
        <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">🕐 <strong style="color:#111827;">${time}</strong></p>
        <p style="margin:0;color:#6b7280;font-size:14px;">👥 <strong style="color:#111827;">${guests} ${Number(guests) === 1 ? 'guest' : 'guests'}</strong></p>
      </div>
      <p style="color:#374151;">If you need to make any changes, please call us at <strong>+44 1908 000 000</strong>.</p>
      <p style="color:#374151;margin-top:24px;">See you soon,<br/><strong>Cafe Tortuga Team</strong> ☕</p>
    </div>
  `) } catch { /* email eșuat — rezervarea e salvată */ }

  // Email notificare admin
  try { await resend?.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🆕 New reservation — ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#0D9488;margin-bottom:4px;">New Reservation</h2>
        <p style="color:#6b7280;margin-bottom:20px;">A new reservation has been submitted at Cafe Tortuga.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Name</td><td style="padding:8px 0;font-weight:600;color:#111827;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;font-weight:600;color:#111827;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:8px 0;font-weight:600;color:#111827;">${phone}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Date</td><td style="padding:8px 0;font-weight:600;color:#111827;">${formatDate(date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Time</td><td style="padding:8px 0;font-weight:600;color:#111827;">${time}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Guests</td><td style="padding:8px 0;font-weight:600;color:#111827;">${guests}</td></tr>
        </table>
        <a href="/admin" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0D9488;color:white;border-radius:8px;text-decoration:none;font-weight:600;">Open Admin Panel</a>
      </div>
    `,
  }) } catch { /* email admin eșuat — rezervarea e salvată */ }

  return NextResponse.json({ success: true, message: 'Reservation received!' })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status } = body
  const normalizedStatus = status === 'respins' ? 'respins' : status

  const validStatuses = ['în așteptare', 'confirmat', 'respins']
  if (!id || !validStatuses.includes(normalizedStatus)) {
    return NextResponse.json({ success: false, message: 'Invalid ID or status.' }, { status: 400 })
  }

  // Fetch rezervarea pentru a trimite emailul clientului
  let reservation: ReservationRow | undefined

  try {
    const rows = await query<ReservationRow>(
      'select id, name, email, phone, guests, date, time, status, created_at, updated_at from reservations where id = :id limit 1',
      { id: Number(id) },
    )
    reservation = rows[0]
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }

  if (!reservation) {
    return NextResponse.json({ success: false, message: 'Reservation not found.' }, { status: 404 })
  }

  try {
    await execute('update reservations set status = :status where id = :id', {
      id: Number(id),
      status: normalizedStatus,
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Error updating status.' }, { status: 500 })
  }

  // Email către client la confirmare sau respingere
  if (normalizedStatus === 'confirmat') {
    await sendToClient(reservation.email, '✅ Your reservation at Cafe Tortuga is confirmed!', `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#0D9488;">Your reservation is confirmed! ☕</h2>
        <p style="color:#374151;">Hi <strong>${reservation.name}</strong>, we're looking forward to seeing you!</p>
        <div style="background:white;border-radius:10px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">📅 <strong style="color:#111827;">${formatDate(reservation.date)}</strong></p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">🕐 <strong style="color:#111827;">${reservation.time}</strong></p>
          <p style="margin:0;color:#6b7280;font-size:14px;">👥 <strong style="color:#111827;">${reservation.guests} ${reservation.guests === 1 ? 'guest' : 'guests'}</strong></p>
        </div>
        <p style="color:#374151;">We'll have your table ready. If you need to cancel or make changes, please call us at <strong>+44 1908 000 000</strong>.</p>
        <p style="color:#374151;margin-top:24px;">See you soon,<br/><strong>Cafe Tortuga Team</strong> ☕</p>
      </div>
    `)
  }

  if (normalizedStatus === 'respins') {
    await sendToClient(reservation.email, 'Your reservation at Cafe Tortuga', `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#EF4444;">Reservation Update</h2>
        <p style="color:#374151;">Hi <strong>${reservation.name}</strong>,</p>
        <p style="color:#374151;">Unfortunately, we are unable to accommodate your reservation for <strong>${formatDate(reservation.date)}</strong> at <strong>${reservation.time}</strong> for <strong>${reservation.guests} ${reservation.guests === 1 ? 'guest' : 'guests'}</strong>.</p>
        <p style="color:#374151;">This may be due to full capacity at that time or a scheduling conflict. We're sorry for the inconvenience.</p>
        <p style="color:#374151;">Please try booking a different date or time, or call us directly at <strong>+44 1908 000 000</strong> and we'll do our best to find a solution.</p>
        <p style="color:#374151;margin-top:24px;">We hope to see you at Cafe Tortuga soon!<br/><strong>Cafe Tortuga Team</strong> ☕</p>
      </div>
    `)
  }

  return NextResponse.json({ success: true, message: `Status updated: ${normalizedStatus}` })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing ID.' }, { status: 400 })
  }

  try {
    await execute('delete from reservations where id = :id', { id: Number(id) })
  } catch {
    return NextResponse.json({ success: false, message: 'Error deleting reservation.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Reservation deleted.' })
}
