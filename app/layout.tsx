import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Great_Vibes, Playfair_Display } from "next/font/google";

const greatVibes = Great_Vibes({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
import "./globals.css";

// 🎨 TIPOGRAFIE 100% SANS-SERIF - MODERN CLEAN
// Plus Jakarta Sans - Sans-serif modern pentru TOATE titlurile (H1-H6)
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Inter - Sans-serif curat pentru body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

/**
 * 🔍 SEO METADATA
 * Pentru cursanți: Metadata = informații pentru Google și social media
 */
export const metadata: Metadata = {
  title: "Vibe Caffè - Specialty Coffee in Milton Keynes",
  description: "Discover the authentic flavours of specialty coffee in a modern and friendly atmosphere. Freshly roasted beans, experienced baristas, free WiFi.",
  keywords: ["coffee shop milton keynes", "specialty coffee", "coffee shop", "vibe caffe"],
  authors: [{ name: "Vibe Coffee Team" }],
  openGraph: {
    title: "Vibe Coffee - Specialty Coffee",
    description: "The perfect place for your daily coffee",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${inter.variable} ${greatVibes.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
