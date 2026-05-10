import Navigation from '@/components/Navigation';
import About from '@/components/About';
import FooterStarter from '@/components/FooterStarter';
import PublicPageHeader from '@/components/PublicPageHeader';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <PublicPageHeader
        eyebrow="Meet the place"
        title="Cerita"
        description="Halaman cerita dibuat terpisah supaya struktur publik mengikuti menu navigasi."
      />
      <About />
      <FooterStarter />
    </>
  );
}
