"use client";

import { useEffect, useState } from "react";
import { fetchPublicCms } from "@/lib/public-cms";
import { defaultPublicSettings, fetchPublicSettings, type PublicSettingsPayload } from "@/lib/public-settings";
import FloatingBottomNav from "./FloatingBottomNav";
import WhatsAppChatWidget from "./WhatsAppChatWidget";

/**
 * Loads floating bottom nav + WhatsApp widget from public APIs.
 * Mount once on public/marketing layouts (not admin/participant/tutor).
 */
export default function PublicFloatingLayer() {
  const [menu, setMenu] = useState(() => ({
    enabled: false,
    items: [] as { label: string; url: string | null; icon?: string; action?: "whatsapp" | "link" }[],
  }));
  const [whatsapp, setWhatsapp] = useState<PublicSettingsPayload["whatsapp"]>(() => defaultPublicSettings().whatsapp);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cms, pub] = await Promise.all([fetchPublicCms(), fetchPublicSettings()]);
        if (cancelled) return;
        if (cms?.floating_menu) {
          setMenu(cms.floating_menu);
        }
        if (pub?.whatsapp) {
          setWhatsapp(pub.whatsapp);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const navVisible = ready && menu.enabled && menu.items.length === 4;

  return (
    <>
      {navVisible ? <FloatingBottomNav config={{ enabled: menu.enabled, items: menu.items }} /> : null}
      <WhatsAppChatWidget settings={whatsapp} reserveBottomNavSpace={navVisible} />
    </>
  );
}
