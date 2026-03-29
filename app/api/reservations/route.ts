import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, guests, date, time } = body

  if (!name || !email || !phone || !guests || !date || !time) {
    return NextResponse.json({ success: false, message: 'Toate câmpurile sunt obligatorii.' }, { status: 400 })
  }

  const { error } = await supabase.from('reservations').insert([{ name, email, phone, guests, date, time }])

  if (error) {
    return NextResponse.json({ success: false, message: 'A apărut o eroare. Te rugăm să încerci din nou.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Rezervare confirmată!' })
}
