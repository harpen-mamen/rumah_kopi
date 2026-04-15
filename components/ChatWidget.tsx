'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderWithLinks(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  LINK_REGEX.lastIndex = 0;
  while ((match = LINK_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    result.push(
      <a key={match.index} href={match[2]}
        className="underline font-semibold hover:opacity-80 transition-opacity"
        style={{ color: '#15803D' }}
        onClick={e => { e.preventDefault(); window.location.href = match![2]; }}
      >{match[1]}</a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  return result;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  showReserveButton?: boolean;
  contextualReplies?: { label: string; text: string }[];
};

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ro', flag: '🇷🇴', label: 'Română' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'uk', flag: '🇺🇦', label: 'Українська' },
];

const WELCOME_BY_LANG: Record<string, string> = {
  en: "Hey! ☕ I'm Cleo, your virtual barista. I can help with anything — menu, prices, reservations or recommendations. What can I get you?",
  ro: "Bună! ☕ Sunt Cleo, barista tău virtual. Te pot ajuta cu orice — meniu, prețuri, rezervări sau recomandări. Ce dorești?",
  fr: "Bonjour! ☕ Je suis Cleo, votre barista virtuel. Je peux vous aider avec tout — menu, prix, réservations ou recommandations. Que puis-je faire pour vous?",
  de: "Hallo! ☕ Ich bin Cleo, dein virtueller Barista. Ich helfe dir gerne weiter — Menü, Preise, Reservierungen oder Empfehlungen. Was darf es sein?",
  es: "¡Hola! ☕ Soy Cleo, tu barista virtual. Puedo ayudarte con todo — menú, precios, reservas o recomendaciones. ¿Qué necesitas?",
  it: "Ciao! ☕ Sono Cleo, il tuo barista virtuale. Posso aiutarti con qualsiasi cosa — menu, prezzi, prenotazioni o consigli. Cosa desideri?",
  pl: "Cześć! ☕ Jestem Cleo, twój wirtualny barista. Mogę pomóc ze wszystkim — menu, ceny, rezerwacje lub rekomendacje. Czego potrzebujesz?",
  uk: "Привіт! ☕ Я Cleo, ваш віртуальний бариста. Можу допомогти з усім — меню, ціни, бронювання або рекомендації. Що бажаєте?",
};

// Initial quick replies shown when chat opens
const QUICK_REPLIES_BY_LANG: Record<string, { label: string; text: string }[]> = {
  en: [
    { label: '📋 See menu', text: 'Show me the menu' },
    { label: '⭐ Recommendations', text: 'What do you recommend?' },
    { label: '📅 Reservations', text: 'I want to make a reservation' },
    { label: '⏰ Opening hours', text: 'What are your opening hours?' },
  ],
  ro: [
    { label: '📋 Vezi meniu', text: 'Arată-mi meniul' },
    { label: '⭐ Recomandări', text: 'Ce recomandați?' },
    { label: '📅 Rezervări', text: 'Vreau să fac o rezervare' },
    { label: '⏰ Program', text: 'Care este programul?' },
  ],
  fr: [
    { label: '📋 Voir menu', text: 'Montrez-moi le menu' },
    { label: '⭐ Recommandations', text: 'Que recommandez-vous?' },
    { label: '📅 Réservations', text: 'Je veux faire une réservation' },
    { label: '⏰ Horaires', text: 'Quels sont vos horaires?' },
  ],
  de: [
    { label: '📋 Menü ansehen', text: 'Zeig mir die Speisekarte' },
    { label: '⭐ Empfehlungen', text: 'Was empfehlen Sie?' },
    { label: '📅 Reservierungen', text: 'Ich möchte reservieren' },
    { label: '⏰ Öffnungszeiten', text: 'Was sind Ihre Öffnungszeiten?' },
  ],
  es: [
    { label: '📋 Ver menú', text: 'Muéstrame el menú' },
    { label: '⭐ Recomendaciones', text: '¿Qué recomiendan?' },
    { label: '📅 Reservas', text: 'Quiero hacer una reserva' },
    { label: '⏰ Horario', text: '¿Cuál es su horario?' },
  ],
  it: [
    { label: '📋 Vedi menu', text: 'Mostrami il menu' },
    { label: '⭐ Consigli', text: 'Cosa consigliate?' },
    { label: '📅 Prenotazioni', text: 'Voglio fare una prenotazione' },
    { label: '⏰ Orari', text: 'Quali sono gli orari?' },
  ],
  pl: [
    { label: '📋 Zobacz menu', text: 'Pokaż mi menu' },
    { label: '⭐ Rekomendacje', text: 'Co polecacie?' },
    { label: '📅 Rezerwacje', text: 'Chcę zarezerwować stolik' },
    { label: '⏰ Godziny otwarcia', text: 'Jakie są godziny otwarcia?' },
  ],
  uk: [
    { label: '📋 Переглянути меню', text: 'Покажи мені меню' },
    { label: '⭐ Рекомендації', text: 'Що рекомендуєте?' },
    { label: '📅 Бронювання', text: 'Хочу забронювати столик' },
    { label: '⏰ Години роботи', text: 'Які у вас години роботи?' },
  ],
};

// Contextual replies shown after certain assistant responses
const CONTEXTUAL_REPLIES: Record<string, Record<string, { label: string; text: string }[]>> = {
  menu: {
    en: [
      { label: '🌱 Vegan options', text: 'What vegan options do you have?' },
      { label: '🍰 Desserts', text: 'What desserts do you have?' },
      { label: '🧊 Cold brew', text: 'Tell me about cold brew options' },
    ],
    ro: [
      { label: '🌱 Opțiuni vegane', text: 'Ce opțiuni vegane aveți?' },
      { label: '🍰 Deserturi', text: 'Ce deserturi aveți?' },
      { label: '🧊 Cafea rece', text: 'Spune-mi despre cold brew' },
    ],
    fr: [
      { label: '🌱 Options véganes', text: 'Quelles options véganes avez-vous?' },
      { label: '🍰 Desserts', text: 'Quels desserts avez-vous?' },
      { label: '🧊 Cold brew', text: 'Parlez-moi du cold brew' },
    ],
    de: [
      { label: '🌱 Vegane Optionen', text: 'Welche veganen Optionen haben Sie?' },
      { label: '🍰 Desserts', text: 'Welche Desserts haben Sie?' },
      { label: '🧊 Cold Brew', text: 'Erzähl mir über Cold Brew' },
    ],
    es: [
      { label: '🌱 Opciones veganas', text: '¿Qué opciones veganas tienen?' },
      { label: '🍰 Postres', text: '¿Qué postres tienen?' },
      { label: '🧊 Cold brew', text: 'Cuéntame sobre el cold brew' },
    ],
    it: [
      { label: '🌱 Opzioni vegane', text: 'Quali opzioni vegane avete?' },
      { label: '🍰 Dolci', text: 'Quali dolci avete?' },
      { label: '🧊 Cold brew', text: 'Parlami del cold brew' },
    ],
    pl: [
      { label: '🌱 Opcje wegańskie', text: 'Jakie macie opcje wegańskie?' },
      { label: '🍰 Desery', text: 'Jakie macie desery?' },
      { label: '🧊 Cold brew', text: 'Opowiedz mi o cold brew' },
    ],
    uk: [
      { label: '🌱 Веганські варіанти', text: 'Які є веганські варіанти?' },
      { label: '🍰 Десерти', text: 'Які є десерти?' },
      { label: '🧊 Cold brew', text: 'Розкажи про cold brew' },
    ],
  },
  reservation: {
    en: [
      { label: '📅 Make a reservation', text: 'I want to book a table' },
      { label: '⏰ Opening hours', text: 'What are your opening hours?' },
    ],
    ro: [
      { label: '📅 Fă o rezervare', text: 'Vreau să rezerv o masă' },
      { label: '⏰ Program', text: 'Care este programul?' },
    ],
    fr: [
      { label: '📅 Faire une réservation', text: 'Je veux réserver une table' },
      { label: '⏰ Horaires', text: 'Quels sont vos horaires?' },
    ],
    de: [
      { label: '📅 Reservierung machen', text: 'Ich möchte einen Tisch reservieren' },
      { label: '⏰ Öffnungszeiten', text: 'Was sind Ihre Öffnungszeiten?' },
    ],
    es: [
      { label: '📅 Hacer reserva', text: 'Quiero reservar una mesa' },
      { label: '⏰ Horario', text: '¿Cuál es su horario?' },
    ],
    it: [
      { label: '📅 Fare prenotazione', text: 'Voglio prenotare un tavolo' },
      { label: '⏰ Orari', text: 'Quali sono gli orari?' },
    ],
    pl: [
      { label: '📅 Zrób rezerwację', text: 'Chcę zarezerwować stolik' },
      { label: '⏰ Godziny otwarcia', text: 'Jakie są godziny otwarcia?' },
    ],
    uk: [
      { label: '📅 Забронювати столик', text: 'Хочу забронювати столик' },
      { label: '⏰ Години роботи', text: 'Які у вас години роботи?' },
    ],
  },
};

function getContextualReplies(replyText: string, lang: string): { label: string; text: string }[] | null {
  const lower = replyText.toLowerCase();
  const isMenuContext = lower.includes('menu') || lower.includes('espresso') || lower.includes('latte')
    || lower.includes('cappuccino') || lower.includes('cold brew') || lower.includes('pastry')
    || lower.includes('croissant') || lower.includes('meniu') || lower.includes('cafea')
    || lower.includes('prețuri') || lower.includes('price') || lower.includes('£');
  const isReservationContext = lower.includes('reserv') || lower.includes('rezerv')
    || lower.includes('book') || lower.includes('table') || lower.includes('masa')
    || lower.includes('prenotar') || lower.includes('réserv') || lower.includes('reservier');

  if (isReservationContext) {
    return (CONTEXTUAL_REPLIES.reservation[lang] || CONTEXTUAL_REPLIES.reservation['en']);
  }
  if (isMenuContext) {
    return (CONTEXTUAL_REPLIES.menu[lang] || CONTEXTUAL_REPLIES.menu['en']);
  }
  return null;
}

const LANG_KEY = 'vibe_chat_lang';

export default function ChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [badge, setBadge] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [manualLang, setManualLang] = useState(false);
  const [lang, setLang] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem(LANG_KEY) || 'en';
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedLang = typeof window !== 'undefined' ? (localStorage.getItem(LANG_KEY) || 'en') : 'en';
    return [{ role: 'assistant', content: WELCOME_BY_LANG[savedLang] || WELCOME_BY_LANG['en'] }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const badgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    if (!open) {
      badgeTimerRef.current = setTimeout(() => setBadge(true), 30000);
    } else {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
      setBadge(false);
    }
    return () => { if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current); };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  function changeLang(newLang: string) {
    setLang(newLang);
    setManualLang(true);
    localStorage.setItem(LANG_KEY, newLang);
    setLangOpen(false);
    // Reset chat cu welcome în noua limbă
    setMessages([{ role: 'assistant' as const, content: WELCOME_BY_LANG[newLang] || WELCOME_BY_LANG['en'] }]);
    setShowQuickReplies(true);
  }

  async function send(text?: string, isQuickReply = false) {
    const textToSend = (text ?? input).trim();
    if (!textToSend || loading) return;
    setInput('');
    // Hide quick replies only when user types manually; keep them available for quick reply chains
    if (!isQuickReply) setShowQuickReplies(false);
    setLangOpen(false);

    // Injectează instrucțiunea de limbă DOAR dacă userul a ales manual
    const langInstruction = manualLang
      ? `[Respond in this language: ${LANGUAGES.find(l => l.code === lang)?.label || 'English'}] `
      : '';
    const fullText = `${langInstruction}${textToSend}`;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const apiMessages = [
        ...messages,
        { role: 'user', content: fullText },
      ];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();

      // Acțiune rezervare automată
      if (data.action === 'book' && data.bookingData) {
        try {
          const bookRes = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data.bookingData),
          });
          const bookData = await bookRes.json();
          if (bookData.success) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: data.reply + ' ✅',
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "Hmm, rezervarea nu a putut fi salvată. 😅 Încearcă pe pagina de rezervări sau sună-ne la +44 1908 000 000.",
              showReserveButton: true,
            }]);
          }
        } catch {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Conexiune întreruptă. 😅 Încearcă rezervarea pe site sau sună-ne direct.",
            showReserveButton: true,
          }]);
        }
      } else {
        const showReserve = data.reply?.toLowerCase().includes('reserv') || data.reply?.toLowerCase().includes('rezerv');
        const activeLang = (!manualLang && data.detectedLang && LANGUAGES.find(l => l.code === data.detectedLang))
          ? data.detectedLang
          : lang;
        const contextReplies = getContextualReplies(data.reply || '', activeLang);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          showReserveButton: showReserve,
          contextualReplies: contextReplies ?? undefined,
        }]);
        // Auto-detectare limbă — actualizează selectorul DOAR dacă nu e ales manual
        if (!manualLang && data.detectedLang && LANGUAGES.find(l => l.code === data.detectedLang) && data.detectedLang !== lang) {
          setLang(data.detectedLang);
          localStorage.setItem(LANG_KEY, data.detectedLang);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Ups, ceva nu a mers. 😅 Încearcă din nou!" }]);
    }
    setLoading(false);
    // Restore so contextual replies on the new message are visible (unless user typed manually)
    if (isQuickReply) setShowQuickReplies(true);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function handleOpen() {
    setOpen(true);
    setMinimized(false);
    setBadge(false);
  }

  function clearChat() {
    const welcome = [{ role: 'assistant' as const, content: WELCOME_BY_LANG[lang] || WELCOME_BY_LANG['en'] }];
    setMessages(welcome);
    setShowQuickReplies(true);
  }

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const quickReplies = QUICK_REPLIES_BY_LANG[lang] || QUICK_REPLIES_BY_LANG['en'];

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={open ? () => setMinimized(m => !m) : handleOpen}
        aria-label="Open chat"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${open && !minimized ? 'scale-95' : 'scale-100'}`}
        style={{ background: 'linear-gradient(135deg, #15803D, #166534)' }}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: '#15803D' }} />
        )}
        {badge && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center z-10">1</span>
        )}
        {open && !minimized ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden transition-all duration-300
            bottom-0 right-0 left-0 top-0 rounded-none
            sm:bottom-24 sm:right-6 sm:left-auto sm:top-auto sm:w-[360px] sm:rounded-2xl sm:max-w-[calc(100vw-2rem)]"
          style={{
            height: minimized ? '0px' : undefined,
            opacity: minimized ? 0 : 1,
            pointerEvents: minimized ? 'none' : 'auto',
            border: '1px solid rgba(21,128,61,0.2)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}
        >
          {/* HEADER */}
          <div className="px-4 py-3 flex items-center gap-3 shrink-0 relative"
            style={{ background: 'linear-gradient(135deg, #15803D, #166534)' }}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0">☕</div>
            <div>
              <p className="font-bold text-white text-sm leading-tight" style={{ fontFamily: 'var(--font-plus-jakarta-sans, sans-serif)' }}>Cleo</p>
              <p className="text-white/70 text-xs">Barista Virtual · Vibe Caffè</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow shadow-green-400" />

              {/* Lang selector */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(o => !o)}
                  className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm px-1.5 py-0.5 rounded-lg hover:bg-white/10"
                  title="Change language"
                >
                  <span>{currentLang.flag}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 w-40">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => changeLang(l.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 transition-colors ${lang === l.code ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                        {lang === l.code && <span className="ml-auto text-green-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={clearChat} title="Clear chat"
                className="text-white/50 hover:text-white/90 transition-colors text-xs">🗑</button>
              <button onClick={() => setOpen(false)} title="Close"
                className="text-white/50 hover:text-white/90 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-white"
            onWheel={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
          >
            {messages.map((m, i) => {
              const isLastAssistant = m.role === 'assistant' && i === messages.length - 1 && !loading;
              return (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2 mt-0.5"
                        style={{ background: 'rgba(21,128,61,0.1)' }}>☕</div>
                    )}
                    <div
                      className="max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                      style={m.role === 'user'
                        ? { background: '#15803D', color: 'white', borderBottomRightRadius: '4px' }
                        : { background: '#f9fafb', color: '#111827', borderBottomLeftRadius: '4px', border: '1px solid #f3f4f6' }}
                    >
                      {m.role === 'assistant' ? renderWithLinks(m.content) : m.content}
                    </div>
                  </div>
                  {m.role === 'assistant' && m.showReserveButton && (
                    <button
                      onClick={() => { router.push('/reservations'); setOpen(false); }}
                      className="ml-9 mt-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all active:scale-95"
                      style={{ background: '#166534' }}
                    >
                      📅 {lang === 'ro' ? 'Rezervă acum' : lang === 'fr' ? 'Réserver' : lang === 'de' ? 'Reservieren' : lang === 'es' ? 'Reservar' : 'Book now'} →
                    </button>
                  )}
                  {/* Contextual quick replies — only on last assistant message, disappear when showQuickReplies is false */}
                  {isLastAssistant && showQuickReplies && m.contextualReplies && m.contextualReplies.length > 0 && (
                    <div className="ml-9 mt-2 flex flex-wrap gap-2">
                      {m.contextualReplies.map(q => (
                        <button key={q.text} onClick={() => send(q.text, true)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:border-green-500 hover:text-green-800 active:scale-95"
                          style={{ background: 'white', borderColor: '#86efac', color: '#15803D' }}>
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {showQuickReplies && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {quickReplies.map(q => (
                  <button key={q.text} onClick={() => send(q.text, true)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:border-green-500 hover:text-green-800 active:scale-95"
                    style={{ background: 'white', borderColor: '#86efac', color: '#15803D' }}>
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2"
                  style={{ background: 'rgba(21,128,61,0.1)' }}>☕</div>
                <div className="px-3 py-2 rounded-2xl text-sm bg-gray-50 border border-gray-100 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={lang === 'ro' ? 'Scrie un mesaj...' : lang === 'fr' ? 'Écrire un message...' : lang === 'de' ? 'Nachricht schreiben...' : lang === 'es' ? 'Escribe un mensaje...' : 'Type a message...'}
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shrink-0"
              style={{ background: '#166534' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
