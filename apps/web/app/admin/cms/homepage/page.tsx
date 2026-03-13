import { getHomepageSettings } from "@/lib/homepage-settings";
import { CmsHomepageClient } from "./CmsHomepageClient";

export const metadata = {
  title: "Homepage | CMS | Admin | Niat Murni",
};

export default async function AdminCmsHomepagePage() {
  let settings = null;
  try {
    settings = await getHomepageSettings();
  } catch {
    // fallback handled in client
  }

  return (
    <div className="space-y-6">
      <CmsHomepageClient initial={settings} />
    </div>
  );
}
