import Navigation from '@/components/Navigation';
import Location from '@/components/Location';
import FooterStarter from '@/components/FooterStarter';
import PublicPageHeader from '@/components/PublicPageHeader';

export default function LocationPage() {
  return (
    <>
      <Navigation />
      <PublicPageHeader
        eyebrow="Come by"
        title="Lokasi"
        description="Informasi lokasi dipisahkan sebagai halaman publik sendiri agar navbar tidak lagi bergantung pada section homepage."
      />
      <Location />
      <FooterStarter />
    </>
  );
}
