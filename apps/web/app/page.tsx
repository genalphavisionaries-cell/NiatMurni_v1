import {
  Header,
  Footer,
  Hero,
  MainBanner,
  PromoStrip,
  FeaturedSection,
  PromoGrid,
  UpcomingClassesSection,
  CtaSection,
  ProgramsSection,
  ContactSection,
} from "@/components/home";
import { defaultHomepageSettings } from "@/lib/homepage-settings";

export default function HomePage() {
  const settings = defaultHomepageSettings;

  return (
    <>
      <Header
        settings={{
          siteName: settings.siteName,
          logoUrl: settings.logoUrl,
          logoAlt: settings.logoAlt,
          headerNav: settings.headerNav,
        }}
      />
      <main>
        <Hero settings={settings.hero} />
        <PromoStrip />
        <FeaturedSection />
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {settings.mainBanners.map((banner) => (
                <MainBanner key={banner.id} banner={banner} />
              ))}
            </div>
          </div>
        </section>
        <PromoGrid />
        <ProgramsSection />
        <UpcomingClassesSection />
        <CtaSection />
        <ContactSection />
      </main>
      <Footer
        settings={{
          footerColumns: settings.footerColumns,
          footerBottom: settings.footerBottom,
          siteName: settings.siteName,
        }}
      />
    </>
  );
}
