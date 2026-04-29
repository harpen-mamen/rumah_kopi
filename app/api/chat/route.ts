import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { KNOWLEDGE_BASE } from '@/lib/knowledge-base'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 300,
    system: KNOWLEDGE_BASE + BOOKING_SYSTEM,
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
