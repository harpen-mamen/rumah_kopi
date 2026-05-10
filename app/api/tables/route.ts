import { NextRequest, NextResponse } from 'next/server'
import { execute, query, type CafeTableRow } from '@/lib/db'

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-').replace(/-+/g, '-')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  try {
    if (code) {
      const rows = await query<CafeTableRow>(
        'select id, name, code, number, location, capacity, is_active, created_at, updated_at from cafe_tables where code = :code and is_active = true limit 1',
        { code: normalizeCode(code) },
      )

      if (!rows[0]) {
        return NextResponse.json({ success: false, message: 'Table not found.' }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: rows[0] })
    }

    const data = await query<CafeTableRow>(
      'select id, name, code, number, location, capacity, is_active, created_at, updated_at from cafe_tables order by number asc, id asc',
    )
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const name = String(body.name || '').trim()
  const code = normalizeCode(String(body.code || name))
  const number = body.number ? Number(body.number) : null
  const location = String(body.location || '').trim()
  const capacity = body.capacity ? Number(body.capacity) : null

  if (!name || !code) {
    return NextResponse.json({ success: false, message: 'Name and code are required.' }, { status: 400 })
  }

  try {
    await execute(
      'insert into cafe_tables (name, code, number, location, capacity, is_active) values (:name, :code, :number, :location, :capacity, true)',
      { name, code, number, location: location || null, capacity },
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const id = Number(body.id)
  const allowed = ['name', 'code', 'number', 'location', 'capacity', 'is_active'] as const
  const updates = Object.entries(body).filter(([field]) => allowed.includes(field as (typeof allowed)[number]))

  if (!id || updates.length === 0) {
    return NextResponse.json({ success: false, message: 'Invalid table update.' }, { status: 400 })
  }

  const values = Object.fromEntries(updates)
  if ('code' in values) values.code = normalizeCode(String(values.code))
  if ('number' in values) values.number = values.number ? Number(values.number) : null
  if ('capacity' in values) values.capacity = values.capacity ? Number(values.capacity) : null
  if ('is_active' in values) values.is_active = Boolean(values.is_active)

  try {
    await execute(`update cafe_tables set ${updates.map(([field]) => `${field} = :${field}`).join(', ')} where id = :id`, { ...values, id })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing ID.' }, { status: 400 })
  }

  try {
    await execute('delete from cafe_tables where id = :id', { id })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
