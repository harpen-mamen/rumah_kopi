import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'nicu.nickname@gmail.com'
const FROM = 'Vibe Caffè <onboarding@resend.dev>'

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

  const { error } = await supabase.from('reservations').insert([{ name, email, phone, guests, date, time }])

  if (error) {
    return NextResponse.json({ success: false, message: 'An error occurred. Please try again.' }, { status: 500 })
  }

  // Email multumire client
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '☕ Thank you for your reservation — Vibe Caffè',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#111827;margin-bottom:4px;">Thank you, ${name}! ☕</h2>
        <p style="color:#374151;margin-bottom:20px;">We've received your reservation request at <strong>Vibe Caffè</strong>. We're reviewing it and you'll receive a confirmation email shortly.</p>
        <div style="background:white;border-radius:10px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">📅 <strong style="color:#111827;">${formatDate(date)}</strong></p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">🕐 <strong style="color:#111827;">${time}</strong></p>
          <p style="margin:0;color:#6b7280;font-size:14px;">👥 <strong style="color:#111827;">${guests} ${Number(guests) === 1 ? 'guest' : 'guests'}</strong></p>
        </div>
        <p style="color:#374151;">If you need to make any changes, please call us at <strong>+44 1908 000 000</strong>.</p>
        <p style="color:#374151;margin-top:24px;">See you soon,<br/><strong>Vibe Caffè Team</strong> ☕</p>
      </div>
    `,
  })

  // Email notificare admin
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🆕 New reservation — ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#0D9488;margin-bottom:4px;">New Reservation</h2>
        <p style="color:#6b7280;margin-bottom:20px;">A new reservation has been submitted at Vibe Caffè.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Name</td><td style="padding:8px 0;font-weight:600;color:#111827;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;font-weight:600;color:#111827;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:8px 0;font-weight:600;color:#111827;">${phone}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Date</td><td style="padding:8px 0;font-weight:600;color:#111827;">${formatDate(date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Time</td><td style="padding:8px 0;font-weight:600;color:#111827;">${time}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Guests</td><td style="padding:8px 0;font-weight:600;color:#111827;">${guests}</td></tr>
        </table>
        <a href="https://vibecaffe-mk.vercel.app/admin" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0D9488;color:white;border-radius:8px;text-decoration:none;font-weight:600;">Open Admin Panel</a>
      </div>
    `,
  })

  return NextResponse.json({ success: true, message: 'Reservation received!' })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status } = body

  const validStatuses = ['în așteptare', 'confirmat', 'respins']
  if (!id || !validStatuses.includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid ID or status.' }, { status: 400 })
  }

  // Fetch rezervarea pentru a trimite emailul clientului
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !reservation) {
    return NextResponse.json({ success: false, message: 'Reservation not found.' }, { status: 404 })
  }

  const { error } = await supabase.from('reservations').update({ status }).eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, message: 'Error updating status.' }, { status: 500 })
  }

  // Email către client la confirmare sau respingere
  if (status === 'confirmat') {
    await resend.emails.send({
      from: FROM,
      to: reservation.email,
      subject: '✅ Your reservation at Vibe Caffè is confirmed!',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#0D9488;">Your reservation is confirmed! ☕</h2>
          <p style="color:#374151;">Hi <strong>${reservation.name}</strong>, we're looking forward to seeing you!</p>
          <div style="background:white;border-radius:10px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">📅 <strong style="color:#111827;">${formatDate(reservation.date)}</strong></p>
            <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">🕐 <strong style="color:#111827;">${reservation.time}</strong></p>
            <p style="margin:0;color:#6b7280;font-size:14px;">👥 <strong style="color:#111827;">${reservation.guests} ${reservation.guests === 1 ? 'guest' : 'guests'}</strong></p>
          </div>
          <p style="color:#374151;">We'll have your table ready. If you need to cancel or make changes, please call us at <strong>+44 1908 000 000</strong>.</p>
          <p style="color:#374151;margin-top:24px;">See you soon,<br/><strong>Vibe Caffè Team</strong> ☕</p>
        </div>
      `,
    })
  }

  if (status === 'respins') {
    await resend.emails.send({
      from: FROM,
      to: reservation.email,
      subject: 'Your reservation at Vibe Caffè',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#EF4444;">Reservation Update</h2>
          <p style="color:#374151;">Hi <strong>${reservation.name}</strong>,</p>
          <p style="color:#374151;">Unfortunately, we are unable to accommodate your reservation for <strong>${formatDate(reservation.date)}</strong> at <strong>${reservation.time}</strong> for <strong>${reservation.guests} ${reservation.guests === 1 ? 'guest' : 'guests'}</strong>.</p>
          <p style="color:#374151;">This may be due to full capacity at that time or a scheduling conflict. We're sorry for the inconvenience.</p>
          <p style="color:#374151;">Please try booking a different date or time, or call us directly at <strong>+44 1908 000 000</strong> and we'll do our best to find a solution.</p>
          <p style="color:#374151;margin-top:24px;">We hope to see you at Vibe Caffè soon!<br/><strong>Vibe Caffè Team</strong> ☕</p>
        </div>
      `,
    })
  }

  return NextResponse.json({ success: true, message: `Status updated: ${status}` })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing ID.' }, { status: 400 })
  }

  const { error } = await supabase.from('reservations').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, message: 'Error deleting reservation.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Reservation deleted.' })
}
