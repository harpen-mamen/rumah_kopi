type PublicPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function PublicPageHeader({ eyebrow, title, description }: PublicPageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 px-6 overflow-hidden bg-black">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50">
        <source src="/hero-coffee.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 max-w-7xl mx-auto text-white">
        <span className="handwrite text-4xl sm:text-5xl block mb-2 text-amber-200">
          {eyebrow}
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          {title}
        </h1>
        <p className="text-sm sm:text-base text-white/75 mt-4 max-w-2xl">
          {description}
        </p>
      </div>
    </section>
  );
}
