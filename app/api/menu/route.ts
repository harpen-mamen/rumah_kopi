import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('id')

  if (error) return NextResponse.json({ success: false }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { category, name, description, price } = body

  const { error } = await supabase
    .from('menu_items')
    .insert([{ category, name, description, price, available: true }])

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...fields } = body

  const { error } = await supabase
    .from('menu_items')
    .update(fields)
    .eq('id', id)

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ success: false }, { status: 400 })

  const { error } = await supabase.from('menu_items').delete().eq('id', id)

  if (error) return NextResponse.json({ success: false }, { status: 500 })
  return NextResponse.json({ success: true })
}
