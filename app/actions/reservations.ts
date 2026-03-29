'use server'

import { supabase } from '@/lib/supabase'

export type ReservationData = {
  name: string
  email: string
  phone: string
  guests: number
  date: string
  time: string
}

export async function createReservation(data: ReservationData) {
  const { error } = await supabase.from('reservations').insert([data])

  if (error) {
    return { success: false, message: 'A apărut o eroare. Te rugăm să încerci din nou.' }
  }

  return { success: true, message: 'Rezervarea ta a fost înregistrată cu succes!' }
}

export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, data: [] }
  }

  return { success: true, data }
}
