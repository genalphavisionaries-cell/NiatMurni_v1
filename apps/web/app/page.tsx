import {
  Header,
  Footer,
  Hero,
  MainBanner,
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
        <ProgramsSection />
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {settings.mainBanners.map((banner) => (
                <MainBanner key={banner.id} banner={banner} />
              ))}
            </div>
          </div>
        </section>
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
