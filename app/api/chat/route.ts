import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { KNOWLEDGE_BASE } from '@/lib/knowledge-base'
import { query, type MenuItemRow } from '@/lib/db'
import { formatPrice } from '@/lib/public-content'

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

function formatMenuForPrompt(items: MenuItemRow[]) {
  if (items.length === 0) return 'Menu database kosong atau belum ada item aktif.'

  const grouped = items.reduce<Record<string, MenuItemRow[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([category, categoryItems]) => {
      const rows = categoryItems.map(item => {
        const description = item.description ? ` | ${item.description}` : ''
        return `- ${item.name} — ${formatPrice(item.price)}${description}`
      })
      return `### ${category}\n${rows.join('\n')}`
    })
    .join('\n\n')
}

async function getLiveMenuPrompt() {
  try {
    const items = await query<MenuItemRow>(
      `select mi.id, mc.name as category, mi.name, mi.description, mi.price, mi.is_available as available
      from menu_items mi
      inner join menu_categories mc on mc.id = mi.menu_category_id
      where mi.is_available = true and mc.is_active = true
      order by mc.sort_order asc, mi.sort_order asc, mi.id asc`,
    )

    return `

## MENU DATABASE TERBARU
Gunakan daftar ini sebagai sumber utama untuk rekomendasi, diskusi menu, harga, dan ketersediaan.
${formatMenuForPrompt(items)}
`
  } catch {
    return `

## MENU DATABASE TERBARU
Menu database sedang tidak bisa dibaca. Jika pengguna bertanya menu, jawab jujur dan arahkan ke [Order menu](/order) atau minta staf mengecek dashboard.
`
  }
}

const BOOKING_SYSTEM = `
## REZERVARE PRIN CHAT

Dacă utilizatorul dorește să facă o rezervare prin chat (nu prin pagina de rezervări), urmează acest flux:

1. Întreabă data dorită
2. Întreabă ora (programul: Lun-Vin 07:00-20:00, Sâm-Dum 08:00-21:00)
3. Întreabă numărul de persoane (1-12)
4. Întreabă numele complet
5. Întreabă emailul pentru confirmare
6. Întreabă numărul de telefon

Când AI are TOATE cele 6 date, răspunde EXCLUSIV cu acest JSON (nimic altceva):
{"action":"book","name":"...","email":"...","phone":"...","date":"YYYY-MM-DD","time":"HH:MM","guests":N,"message":"Mesaj confirmare prietenos în limba utilizatorului"}

Reguli stricte:
- Nu face presupuneri despre date lipsă
- Data trebuie convertită în format YYYY-MM-DD
- Ora trebuie să fie în format HH:MM
- Dacă utilizatorul zice "vineri" calculează data corectă față de azi (${new Date().toISOString().split('T')[0]})
- Numărul de telefon poate fi în orice format — păstrează-l ca string
`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // Keep last 10 messages; skip the initial assistant welcome (index 0) since context is in system prompt
  const history = messages
    .slice(1)
    .slice(-10)
    .map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  // Ensure history always ends with a user message
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    if (lastUser) history.push({ role: 'user' as const, content: lastUser.content })
  }

  if (!anthropic) {
    const lastUserMsg = history.filter((m: { role: string }) => m.role === 'user').pop()?.content || ''
    return NextResponse.json(await fallbackReply(lastUserMsg))
  }

  const liveMenuPrompt = await getLiveMenuPrompt()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    system: KNOWLEDGE_BASE + liveMenuPrompt + BOOKING_SYSTEM,
    messages: history,
  })

  const text = response.content[0].type === 'text'
    ? response.content[0].text
    : "Hmm, something went sideways there. 😅 Try again!"

  // Detectează dacă AI a returnat JSON de booking
  try {
    const jsonMatch = text.match(/\{[\s\S]*"action"\s*:\s*"book"[\s\S]*\}/)
    if (jsonMatch) {
      const booking = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        reply: booking.message,
        action: 'book',
        bookingData: {
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          date: booking.date,
          time: booking.time,
          guests: booking.guests,
        },
      })
    }
  } catch { /* nu e JSON, răspuns normal */ }

  // Detectează limba — skip dacă mesajul e număr de telefon, dată, oră sau cifre
  const lastUserMsg = history.filter((m: { role: string }) => m.role === 'user').pop()?.content || ''
  const isNonText = /^[\d\s\+\-\(\)\/\:\.@]+$/.test(lastUserMsg.trim()) || lastUserMsg.trim().length < 3
  let detectedLang = 'en'
  if (!isNonText) {
    const langDetectRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      system: 'Detect the language of the text and respond with ONLY the ISO 639-1 code (en, ro, fr, de, es, it, pl, uk). Nothing else.',
      messages: [{ role: 'user', content: lastUserMsg }],
    })
    detectedLang = langDetectRes.content[0].type === 'text'
      ? langDetectRes.content[0].text.trim().toLowerCase().slice(0, 2)
      : 'en'
  }

  return NextResponse.json({ reply: text, detectedLang })
}

async function fallbackReply(message: string) {
  const text = message.toLowerCase()
  const wantsRecommendation = text.includes('rekomend') || text.includes('saran') || text.includes('recommend') || text.includes('suggest') || text.includes('enak') || text.includes('bingung')
  const wantsCold = text.includes('dingin') || text.includes('cold') || text.includes('ice') || text.includes('iced')
  const wantsSweet = text.includes('manis') || text.includes('sweet') || text.includes('caramel') || text.includes('dessert')
  const wantsMilk = text.includes('susu') || text.includes('milk') || text.includes('latte') || text.includes('creamy')
  const wantsPastry = text.includes('pastry') || text.includes('cake') || text.includes('roti') || text.includes('croissant') || text.includes('dessert')

  if (text.includes('book') || text.includes('booking') || text.includes('reserv') || text.includes('meja')) {
    return {
      reply: 'Bisa. Cara paling cepat lewat halaman booking: [Book a table](/reservations). Booking yang masuk akan tampil di dashboard admin.',
      detectedLang: 'id',
    }
  }

  if (text.includes('order') || text.includes('pesan') || text.includes('beli')) {
    return {
      reply: 'Bisa pesan menu dari halaman ini: [Order menu](/order). Setelah dikirim, order langsung masuk ke dashboard admin.',
      detectedLang: 'id',
    }
  }

  if (text.includes('menu') || text.includes('coffee') || text.includes('kopi') || text.includes('latte')) {
    try {
      const items = await query<MenuItemRow>(
        `select mi.id, mc.name as category, mi.name, mi.description, mi.price, mi.is_available as available
        from menu_items mi
        inner join menu_categories mc on mc.id = mi.menu_category_id
        where mi.is_available = true and mc.is_active = true
        order by mc.sort_order asc, mi.sort_order asc, mi.id asc`,
      )
      let candidates = items

      if (wantsPastry) candidates = items.filter(item => `${item.category} ${item.name} ${item.description}`.toLowerCase().match(/pastry|cake|croissant|brownie|roll|chocolat/))
      else if (wantsCold) candidates = items.filter(item => `${item.category} ${item.name} ${item.description}`.toLowerCase().match(/cold|iced|nitro|lemonade|tonic/))
      else if (wantsSweet) candidates = items.filter(item => `${item.name} ${item.description}`.toLowerCase().match(/caramel|vanilla|honey|lavender|rose|chocolate|brownie|cake|cinnamon/))
      else if (wantsMilk) candidates = items.filter(item => `${item.name} ${item.description}`.toLowerCase().match(/latte|milk|oat|cappuccino|flat white|cortado/))

      const picked = (candidates.length ? candidates : items).slice(0, wantsRecommendation ? 3 : 6)
      const menuText = picked.map(item => `${item.name} ${formatPrice(item.price)}`).join(', ')

      if (wantsRecommendation) {
        return {
          reply: `Kalau di Cafe Tortuga, aku sarankan ${menuText || 'menu favorit sedang disiapkan'}. Kalau mau aku persempit lagi, kamu lagi pengin yang panas, dingin, manis, atau creamy?`,
          detectedLang: 'id',
        }
      }

      return {
        reply: `Menu Cafe Tortuga yang tersedia: ${menuText || 'menu sedang disiapkan'}. Lihat lengkapnya di [See full menu](/#menu) atau langsung [Order menu](/order).`,
        detectedLang: 'id',
      }
    } catch {
      return {
        reply: 'Menu sedang belum bisa dibaca dari database. Pastikan MySQL XAMPP aktif dan schema sudah diimport.',
        detectedLang: 'id',
      }
    }
  }

  return {
    reply: 'Halo, saya Cleo, barista virtual Cafe Tortuga. Ceritakan kamu lagi pengin rasa seperti apa, nanti aku bantu pilihkan menu; atau langsung ke [See menu](/#menu), [Book a table](/reservations), [Order menu](/order).',
    detectedLang: 'id',
  }
}
