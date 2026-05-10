export type SiteSetting = {
  site_name?: string | null
  tagline?: string | null
  description?: string | null
  logo?: string | null
  address?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  instagram_url?: string | null
  tiktok_url?: string | null
  google_maps_url?: string | null
}

export type HeroSection = {
  headline?: string | null
  subheadline?: string | null
  description?: string | null
  primary_button_text?: string | null
  primary_button_url?: string | null
  secondary_button_text?: string | null
  secondary_button_url?: string | null
  hero_image?: string | null
  hero_video?: string | null
  hero_media_type?: 'image' | 'video' | null
  overlay_opacity?: number | string | null
}

export type Feature = {
  id: number
  title: string
  description?: string | null
  icon?: string | null
  image?: string | null
}

export type AboutSection = {
  title?: string | null
  subtitle?: string | null
  content?: string | null
  image?: string | null
  button_text?: string | null
  button_url?: string | null
}

export type MenuCategory = {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  image?: string | null
}

export type MenuItem = {
  id: number
  menu_category_id?: number
  category?: string
  name: string
  description?: string | null
  price: number
  image?: string | null
  is_available?: boolean
  available?: boolean
  is_featured?: boolean
}

export type GalleryItem = {
  id: number
  title: string
  image: string
  caption?: string | null
}

export type Testimonial = {
  id: number
  customer_name: string
  customer_position?: string | null
  rating?: number
  message: string
  photo?: string | null
}

export type OpeningHour = {
  id: number
  day: string
  open_time?: string | null
  close_time?: string | null
  is_closed?: boolean
}

export type Promo = {
  id: number
  title: string
  description?: string | null
  image?: string | null
  button_text?: string | null
  button_url?: string | null
  start_date?: string | null
  end_date?: string | null
}

export type PublicHomeData = {
  site_setting?: SiteSetting | null
  hero?: HeroSection | null
  features?: Feature[]
  about?: AboutSection | null
  featured_menu?: MenuItem[]
  gallery?: GalleryItem[]
  testimonials?: Testimonial[]
  opening_hours?: OpeningHour[]
  promos?: Promo[]
}

export type PublicMenuData = {
  categories: MenuCategory[]
  items: MenuItem[]
}

export const fallbackSite: SiteSetting = {
  site_name: 'TORTUGA AREA',
  tagline: 'Coffee, Space, and Island Vibes',
  description: 'Coffee shop hangat untuk menikmati kopi, makanan ringan, dan waktu yang pelan.',
  address: 'Milton Keynes, United Kingdom',
  phone: '+44 1908 000 000',
  email: 'hello@cafetortuga.com',
  instagram_url: 'https://instagram.com/cafetortuga',
  tiktok_url: 'https://tiktok.com/@cafetortuga',
  google_maps_url: 'https://maps.google.com/?q=Midsummer+Boulevard+Milton+Keynes',
}

export const fallbackHome: PublicHomeData = {
  site_setting: fallbackSite,
  hero: {
    headline: 'TORTUGA AREA',
    subheadline: 'Welcome to your favourite place',
    description: 'Freshly roasted. Crafted with care. Always a warm welcome.',
    primary_button_text: 'Lihat Menu',
    primary_button_url: '#menu',
    secondary_button_text: 'Lokasi',
    secondary_button_url: '#location',
    hero_video: '/hero-coffee.mp4',
    hero_media_type: 'video',
    overlay_opacity: 0.52,
  },
  features: [],
  about: {
    title: 'Cerita Kami',
    subtitle: 'Coffee, people, and craft',
    content:
      'Kami membangun ruang yang hangat untuk kopi yang dibuat serius, percakapan yang pelan, dan tamu yang ingin kembali lagi.',
    image: '/about-interior.jpg',
  },
  featured_menu: [],
  gallery: [],
  testimonials: [],
  opening_hours: [],
  promos: [],
}

export function backendBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.BACKEND_API_URL ||
    'http://127.0.0.1:8000/api'
  ).replace(/\/$/, '')
}

export function backendOrigin() {
  return backendBaseUrl().replace(/\/api$/, '')
}

export function publicAssetUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path
  return `${backendOrigin()}/storage/${path.replace(/^public\//, '')}`
}

export function formatPrice(price: number | string | null | undefined) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(price || 0))
}

export function formatHour(hour: OpeningHour) {
  if (hour.is_closed) return 'Tutup'
  const open = (hour.open_time || '').slice(0, 5)
  const close = (hour.close_time || '').slice(0, 5)
  return open && close ? `${open} - ${close}` : 'Jam belum diatur'
}
