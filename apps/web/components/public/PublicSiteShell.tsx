import type { ReactNode } from "react";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { fetchPublicCms } from "@/lib/public-cms";
import PublicSiteShellRuntime from "./PublicSiteShellRuntime";

type Props = {
  children: ReactNode;
  /** Extra classes for the main content area (below site header) */
  mainClassName?: string;
};

/**
 * Shared CMS-driven public site chrome: theme CSS vars, header, footer.
 * Use on marketing/booking flows; not for /admin, /user, /tutor shells.
 */
export default async function PublicSiteShell({
  children,
  mainClassName = "min-h-[60vh] flex-1 bg-stone-50",
}: Props) {
  const [initialSettings, initialCms] = await Promise.all([
    getHomepageSettings(),
    fetchPublicCms(),
  ]);

  return (
    <PublicSiteShellRuntime
      mainClassName={mainClassName}
      initialSettings={initialSettings}
      initialCms={initialCms}
    >
      {children}
    </PublicSiteShellRuntime>
  );
}
