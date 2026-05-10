import { NextRequest, NextResponse } from 'next/server'
import type { ResultSetHeader } from 'mysql2'
import { execute, query } from '@/lib/db'

type MenuCategoryRow = {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  sort_order: number
  is_active: boolean
}

type MenuItemResponse = {
  id: number
  menu_category_id: number
  category: string
  name: string
  slug: string
  description: string | null
  price: number
  image: string | null
  available: boolean
  is_available: boolean
  is_featured: boolean
  sort_order: number
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item'
}

async function uniqueSlug(table: 'menu_categories' | 'menu_items', base: string, ignoreId?: number) {
  const slug = slugify(base)
  let candidate = slug
  let suffix = 2

  while (true) {
    const rows = await query<{ id: number }>(
      `select id from ${table} where slug = :slug ${ignoreId ? 'and id <> :ignoreId' : ''} limit 1`,
      ignoreId ? { slug: candidate, ignoreId } : { slug: candidate },
    )
    if (rows.length === 0) return candidate
    candidate = `${slug}-${suffix++}`
  }
}

async function getOrCreateCategory(name: string) {
  const cleanName = name.trim() || 'Menu'
  const existing = await query<MenuCategoryRow>(
    'select id, name, slug, description, image, sort_order, is_active from menu_categories where name = :name limit 1',
    { name: cleanName },
  )
  if (existing[0]) return existing[0]

  const slug = await uniqueSlug('menu_categories', cleanName)
  const result = (await execute(
    'insert into menu_categories (name, slug, description, sort_order, is_active, created_at, updated_at) values (:name, :slug, null, 0, true, current_timestamp, current_timestamp)',
    { name: cleanName, slug },
  )) as ResultSetHeader

  return {
    id: result.insertId,
    name: cleanName,
    slug,
    description: null,
    image: null,
    sort_order: 0,
    is_active: true,
  }
}

export async function GET() {
  try {
    const categories = await query<MenuCategoryRow>(
      `select id, name, slug, description, image, sort_order, is_active
      from menu_categories
      where is_active = true
      order by sort_order asc, name asc`,
    )

    const items = await query<MenuItemResponse>(
      `select
        mi.id, mi.menu_category_id, mc.name as category, mi.name, mi.slug, mi.description, mi.price, mi.image,
        mi.is_available as available, mi.is_available, mi.is_featured, mi.sort_order
      from menu_items mi
      inner join menu_categories mc on mc.id = mi.menu_category_id
      where mc.is_active = true
      order by mc.sort_order asc, mi.sort_order asc, mi.id asc`,
    )

    return NextResponse.json({
      success: true,
      data: items.map(item => ({
        ...item,
        price: Number(item.price || 0),
        available: Boolean(item.available),
        is_available: Boolean(item.is_available),
        is_featured: Boolean(item.is_featured),
      })),
      categories,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message, data: [], categories: [] }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const name = String(body.name || '').trim()
  const categoryName = String(body.category || body.category_name || '').trim()
  const description = String(body.description || '').trim()
  const price = Number(body.price)

  if (!name || Number.isNaN(price)) {
    return NextResponse.json({ success: false, message: 'Name and valid price are required.' }, { status: 400 })
  }

  try {
    const category = await getOrCreateCategory(categoryName || 'Menu')
    const slug = await uniqueSlug('menu_items', name)

    await execute(
      `insert into menu_items
        (menu_category_id, name, slug, description, price, image, is_available, is_featured, sort_order, created_at, updated_at)
      values
        (:menu_category_id, :name, :slug, :description, :price, null, :is_available, :is_featured, :sort_order, current_timestamp, current_timestamp)`,
      {
        menu_category_id: category.id,
        name,
        slug,
        description: description || null,
        price,
        is_available: body.available === undefined ? true : Boolean(body.available),
        is_featured: Boolean(body.is_featured),
        sort_order: Number(body.sort_order || 0),
      },
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

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing menu item ID.' }, { status: 400 })
  }

  try {
    const updates: string[] = []
    const values: Record<string, unknown> = { id }

    if ('category' in body) {
      const category = await getOrCreateCategory(String(body.category || 'Menu'))
      updates.push('menu_category_id = :menu_category_id')
      values.menu_category_id = category.id
    }
    if ('name' in body) {
      const name = String(body.name || '').trim()
      if (!name) return NextResponse.json({ success: false, message: 'Name cannot be empty.' }, { status: 400 })
      updates.push('name = :name', 'slug = :slug')
      values.name = name
      values.slug = await uniqueSlug('menu_items', name, id)
    }
    if ('description' in body) {
      updates.push('description = :description')
      values.description = String(body.description || '').trim() || null
    }
    if ('price' in body) {
      const price = Number(body.price)
      if (Number.isNaN(price)) return NextResponse.json({ success: false, message: 'Price is invalid.' }, { status: 400 })
      updates.push('price = :price')
      values.price = price
    }
    if ('available' in body || 'is_available' in body) {
      updates.push('is_available = :is_available')
      values.is_available = Boolean(body.available ?? body.is_available)
    }
    if ('is_featured' in body) {
      updates.push('is_featured = :is_featured')
      values.is_featured = Boolean(body.is_featured)
    }
    if ('sort_order' in body) {
      updates.push('sort_order = :sort_order')
      values.sort_order = Number(body.sort_order || 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid fields to update.' }, { status: 400 })
    }

    await execute(`update menu_items set ${updates.join(', ')}, updated_at = current_timestamp where id = :id`, values)
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
    return NextResponse.json({ success: false, message: 'Missing menu item ID.' }, { status: 400 })
  }

  try {
    await execute('delete from menu_items where id = :id', { id })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
