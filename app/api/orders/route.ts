import { NextRequest, NextResponse } from 'next/server'
import type { ResultSetHeader } from 'mysql2'
import { execute, query, transaction, type CafeTableRow, type OrderItemRow, type OrderRow } from '@/lib/db'

type OrderPayloadItem = {
  menu_item_id: number
  quantity: number
  note?: string
}

type MenuItemForOrder = {
  id: number
  name: string
  price: number
  is_available: boolean
}

function makeOrderNumber() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replaceAll('-', '')
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ORD-${date}-${random}`
}

export async function GET() {
  try {
    const orders = await query<OrderRow & { item_count: number }>(
      `select
        o.id, o.order_number, o.cafe_table_id, o.table_code, t.name as table_name,
        o.customer_name, '' as customer_phone, o.customer_note,
        o.subtotal, o.total, o.status, o.ordered_at, o.completed_at, o.created_at, o.updated_at,
        coalesce(sum(oi.quantity), 0) as item_count
      from orders o
      left join cafe_tables t on t.id = o.cafe_table_id
      left join order_items oi on oi.order_id = o.id
      group by o.id
      order by o.ordered_at desc, o.id desc`,
    )

    if (orders.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const items = await query<OrderItemRow>(
      `select id, order_id, menu_item_id, menu_name_snapshot, price_snapshot, quantity, note, subtotal
      from order_items
      where order_id in (${orders.map(() => '?').join(',')})
      order by id asc`,
      orders.map(order => order.id),
    )

    return NextResponse.json({
      success: true,
      data: orders.map(order => ({
        ...order,
        items: items.filter(item => item.order_id === order.id),
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const customerName = String(body.customer_name || '').trim()
  const customerPhone = String(body.customer_phone || '').trim()
  const customerNote = String(body.customer_note || '').trim()
  const tableCode = String(body.table_code || '').trim().toUpperCase()
  const items = Array.isArray(body.items) ? body.items as OrderPayloadItem[] : []

  if (!customerName || items.length === 0) {
    return NextResponse.json({ success: false, message: 'Name and at least one item are required.' }, { status: 400 })
  }

  const cleanItems = items
    .map(item => ({
      menu_item_id: Number(item.menu_item_id),
      quantity: Number(item.quantity),
      note: String(item.note || '').trim(),
    }))
    .filter(item => Number.isInteger(item.menu_item_id) && Number.isInteger(item.quantity) && item.quantity > 0)

  if (cleanItems.length === 0) {
    return NextResponse.json({ success: false, message: 'Order items are invalid.' }, { status: 400 })
  }

  try {
    const menuItems = await query<MenuItemForOrder>(
      `select id, name, price, is_available
      from menu_items
      where is_available = true and id in (${cleanItems.map(() => '?').join(',')})`,
      cleanItems.map(item => item.menu_item_id),
    )

    let table: CafeTableRow | undefined
    if (tableCode) {
      const tables = await query<CafeTableRow>(
        'select id, name, code, number, location, capacity, is_active, created_at, updated_at from cafe_tables where code = :code and is_active = true limit 1',
        { code: tableCode },
      )
      table = tables[0]
      if (!table) {
        return NextResponse.json({ success: false, message: 'QR table code is not valid.' }, { status: 422 })
      }
    }

    if (menuItems.length !== new Set(cleanItems.map(item => item.menu_item_id)).size) {
      return NextResponse.json({ success: false, message: 'One or more menu items are unavailable.' }, { status: 422 })
    }

    const lines = cleanItems.map(item => {
      const menu = menuItems.find(menuItem => menuItem.id === item.menu_item_id)!
      const subtotal = Number(menu.price) * item.quantity

      return {
        ...item,
        menu_name_snapshot: menu.name,
        price_snapshot: Number(menu.price),
        subtotal,
      }
    })
    const subtotal = lines.reduce((sum, item) => sum + item.subtotal, 0)
    const total = subtotal
    const orderNumber = makeOrderNumber()
    const note = [customerPhone ? `Phone: ${customerPhone}` : '', customerNote].filter(Boolean).join('\n')

    const orderId = await transaction(async (connection) => {
      const [orderResult] = await connection.execute(
        `insert into orders
          (order_number, cafe_table_id, table_code, customer_name, customer_note, subtotal, total, status, ordered_at, created_at, updated_at)
        values (?, ?, ?, ?, ?, ?, ?, 'pending', current_timestamp, current_timestamp, current_timestamp)`,
        [orderNumber, table?.id || null, table?.code || null, customerName, note || null, subtotal, total],
      )
      const id = (orderResult as ResultSetHeader).insertId

      for (const line of lines) {
        await connection.execute(
          `insert into order_items
            (order_id, menu_item_id, menu_name_snapshot, price_snapshot, quantity, note, subtotal, created_at, updated_at)
          values (?, ?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)`,
          [id, line.menu_item_id, line.menu_name_snapshot, line.price_snapshot, line.quantity, line.note || null, line.subtotal],
        )
      }

      return id
    })

    return NextResponse.json({
      success: true,
      data: {
        id: orderId,
        order_number: orderNumber,
        total,
        status: 'pending',
        table_code: table?.code || null,
        table_name: table?.name || null,
      },
      message: 'Order received.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const id = Number(body.id)
  const status = String(body.status || '')
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

  if (!id || !validStatuses.includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid order ID or status.' }, { status: 400 })
  }

  try {
    await execute(
      `update orders
      set status = :status, completed_at = if(:status = 'completed', current_timestamp, completed_at), updated_at = current_timestamp
      where id = :id`,
      { id, status },
    )
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
    await execute('delete from orders where id = :id', { id })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
