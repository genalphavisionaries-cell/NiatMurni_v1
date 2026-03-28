import type { Metadata } from "next";
import HomePageRuntime from "@/components/home/HomePageRuntime";
import {
  defaultHomepageSettings,
  getHomepageSettings,
  type HomepageSettings,
} from "@/lib/homepage-settings";
import { fetchPublicCms, cmsString, type PublicCmsPayload } from "@/lib/public-cms";

const DEFAULT_TITLE = "Niat Murni Academy";
const DEFAULT_DESC =
  "KKM Food Handling & Training — professional food safety courses for food handlers in Malaysia.";

export async function generateMetadata(): Promise<Metadata> {
  let cms: PublicCmsPayload | null = null;
  try {
    cms = await fetchPublicCms();
  } catch (e) {
    console.error("CMS fetch failed:", e);
  }
  const title =
    cmsString(cms?.seo.homepage_seo_title) ??
    cmsString(cms?.seo.default_seo_title) ??
    DEFAULT_TITLE;
  const description =
    cmsString(cms?.seo.homepage_seo_description) ??
    cmsString(cms?.seo.default_seo_description) ??
    DEFAULT_DESC;
  const og = cmsString(cms?.seo.homepage_og_image_url);
  const favicon = cmsString(cms?.site.favicon_url);

  return {
    title,
    description,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      title,
      description,
      ...(og ? { images: [{ url: og }] } : {}),
    },
  };
}

export default async function HomePage() {
  let settings: HomepageSettings = defaultHomepageSettings;
  let cms: PublicCmsPayload | null = null;

  const [settingsSettled, cmsSettled] = await Promise.allSettled([
    getHomepageSettings(),
    fetchPublicCms(),
  ]);

  if (settingsSettled.status === "fulfilled") {
    settings = settingsSettled.value;
  } else {
    console.error("Homepage settings fetch failed:", settingsSettled.reason);
  }

  if (cmsSettled.status === "fulfilled") {
    cms = cmsSettled.value;
  } else {
    console.error("CMS fetch failed:", cmsSettled.reason);
  }
  if (cms === null) {
    console.error("CMS FAILED TO LOAD");
  }

  return <HomePageRuntime initialSettings={settings} initialCms={cms} />;
}
