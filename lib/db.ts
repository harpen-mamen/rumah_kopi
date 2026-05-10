import mysql from 'mysql2/promise'

export type MenuItemRow = {
  id: number
  category: string
  name: string
  description: string
  price: number
  available: boolean
  created_at?: string
  updated_at?: string
}

export type ReservationRow = {
  id: number
  name: string
  email: string
  phone: string
  guests: number
  date: string
  time: string
  status: string
  created_at: string
  updated_at?: string
}

export type OrderRow = {
  id: number
  order_number: string
  cafe_table_id?: number | null
  table_code?: string | null
  table_name?: string | null
  customer_name: string
  customer_phone: string
  customer_note: string | null
  subtotal: number
  total: number
  status: string
  ordered_at: string
  completed_at?: string | null
  created_at: string
  updated_at?: string | null
}

export type CafeTableRow = {
  id: number
  name: string
  code: string
  number: number | null
  location: string | null
  capacity: number | null
  is_active: boolean
  created_at: string
  updated_at?: string | null
}

export type OrderItemRow = {
  id: number
  order_id: number
  menu_item_id: number | null
  menu_name_snapshot: string
  price_snapshot: number
  quantity: number
  note: string | null
  subtotal: number
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'rumah_kopi',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  dateStrings: true,
  decimalNumbers: true,
})

export async function query<T>(sql: string, values: Record<string, unknown> | unknown[] = []) {
  const executeSql = pool.execute.bind(pool) as (statement: string, params?: unknown) => Promise<[unknown, unknown]>
  const [rows] = await executeSql(sql, values)
  return rows as T[]
}

export async function execute(sql: string, values: Record<string, unknown> | unknown[] = []) {
  const executeSql = pool.execute.bind(pool) as (statement: string, params?: unknown) => Promise<[unknown, unknown]>
  const [result] = await executeSql(sql, values)
  return result
}

export async function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
