import {
  Footer,
  HeroLayout,
  PromoStrip,
  PromoGrid,
  UpcomingClassesSection,
  WhyChooseSection,
  SocialProofSection,
} from "@/components/home";
import { getHomepageSettings } from "@/lib/homepage-settings";

export default async function HomePage() {
  const settings = await getHomepageSettings();

  return (
    <>
      <main>
        <HeroLayout siteName={settings.siteName} logoUrl={settings.logoUrl} />
        <WhyChooseSection data={settings.whyChoose} />
        <SocialProofSection data={settings.socialProof} />
        <PromoStrip />
        <PromoGrid />
        <UpcomingClassesSection />
      </main>
      <Footer
        settings={{
          footerColumns: settings.footerColumns,
          footerBottom: settings.footerBottom,
          siteName: settings.siteName,
          paymentMethodIcons: settings.paymentMethodIcons,
          footerLogoUrl: settings.footerLogoUrl,
          footerDescription: settings.footerDescription,
          footerSslBadgeUrl: settings.footerSslBadgeUrl,
        }}
      />
    </>
  );
}
