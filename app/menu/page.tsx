import Navigation from '@/components/Navigation';
import Menu from '@/components/Menu';
import FooterStarter from '@/components/FooterStarter';
import PublicPageHeader from '@/components/PublicPageHeader';

export default function PublicMenuPage() {
  return (
    <>
      <Navigation />
      <PublicPageHeader
        eyebrow="From admin to table"
        title="Menu"
        description="Menu ini membaca data yang sama dengan dashboard admin Menu & Prices."
      />
      <Menu />
      <FooterStarter />
    </>
  );
}
