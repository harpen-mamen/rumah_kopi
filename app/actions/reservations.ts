'use server'

import { execute, query, type ReservationRow } from '@/lib/db'

export type ReservationData = {
  name: string
  email: string
  phone: string
  guests: number
  date: string
  time: string
}

export async function createReservation(data: ReservationData) {
  try {
    await execute(
      'insert into reservations (name, email, phone, guests, date, time) values (:name, :email, :phone, :guests, :date, :time)',
      { ...data, guests: Number(data.guests) },
    )

    return { success: true, message: 'Rezervarea ta a fost înregistrată cu succes!' }
  } catch {
    return { success: false, message: 'A apărut o eroare. Te rugăm să încerci din nou.' }
  }
}

export async function getReservations() {
  try {
    const data = await query<ReservationRow>(
      'select id, name, email, phone, guests, date, time, status, created_at, updated_at from reservations order by created_at desc',
    )

    return { success: true, data }
  } catch {
    return { success: false, data: [] }
  }
}
