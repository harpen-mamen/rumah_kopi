/**
 * 🏠 HOME PAGE - VERSIUNEA STARTER PENTRU CURSANȚI
 *
 * Aceasta este versiunea SIMPLĂ de la care plecăm.
 * Doar 2 componente: Hero + Footer.
 *
 * În timpul cursului vom construi împreună:
 * - Navigation (meniu navigare)
 * - Features (carduri cu beneficii)
 * - Menu (lista de produse)
 * - About (secțiune despre noi)
 * - Și multe altele!
 */

// Importăm componentele starter (versiuni simple)
import Navigation from '@/components/Navigation';
import HeroStarter from '@/components/HeroStarter';
import Features from '@/components/Features';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Location from '@/components/Location';
import FooterStarter from '@/components/FooterStarter';

/**
 * 📄 COMPONENTA HOME
 * - export default = exportul principal al fișierului
 * - Next.js caută automat "export default" în fiecare page.tsx
 */
export default function Home() {
  return (
    <>
      {/*
        🎯 STRUCTURA MINIMALĂ
        1. Hero (ecran principal cu titlu + CTA)
        2. Footer (copyright)

        MISIUNEA TA ÎN CURS:
        Între Hero și Footer vom construi împreună toate secțiunile!
      */}

      <Navigation />
      <HeroStarter />
      <Features />
      <About />
      <Menu />
      <Location />
      <FooterStarter />

      {/*
        📚 CONCEPTE DE ÎNVĂȚAT:

        1. COMPONENTE = bucăți reutilizabile de UI
           - <HeroStarter /> = componenta Hero (fișierul components/HeroStarter.tsx)
           - Fiecare componentă e ca un "custom HTML tag"

        2. IMPORT/EXPORT
           - import HeroStarter from '@/components/HeroStarter' = aduce componenta
           - @ = alias pentru root folder (configurat în tsconfig.json)
           - export default = face componenta disponibilă pentru import

        3. JSX = HTML în JavaScript
           - Acest cod arată ca HTML dar e JSX (JavaScript XML)
           - JSX permite să scrii markup direct în JavaScript

        4. NEXT.JS ROUTING
           - app/page.tsx = homepage (/)
           - app/despre/page.tsx = /despre
           - Routing automat bazat pe structura folderelor!
      */}
    </>
  );
}
