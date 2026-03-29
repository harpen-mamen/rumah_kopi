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

// PATCH /api/reservations — schimbă statusul unei rezervări
// statusuri valide: 'în așteptare', 'confirmat', 'respins'
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status } = body

  const validStatuses = ['în așteptare', 'confirmat', 'respins']
  if (!id || !validStatuses.includes(status)) {
    return NextResponse.json({ success: false, message: 'ID sau status invalid.' }, { status: 400 })
  }

  const { error } = await supabase.from('reservations').update({ status }).eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, message: 'Eroare la actualizarea statusului.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: `Status actualizat: ${status}` })
}

// DELETE /api/reservations — șterge o rezervare după ID
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ success: false, message: 'ID lipsă.' }, { status: 400 })
  }

  const { error } = await supabase.from('reservations').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, message: 'Eroare la ștergerea rezervării.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Rezervare ștearsă.' })
}
