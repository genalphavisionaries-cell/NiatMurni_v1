"use client";

import type { PublicCmsFloatingMenu } from "@/lib/public-cms";
import type { PublicWhatsAppSettings } from "@/lib/public-settings";
import FloatingBottomNav from "./FloatingBottomNav";
import WhatsAppChatWidget from "./WhatsAppChatWidget";

type Props = {
  floatingMenu: PublicCmsFloatingMenu;
  whatsapp: PublicWhatsAppSettings;
};

/**
 * Floating bottom nav + WhatsApp widget. Data is loaded on the server and passed in
 * (no client-side CMS refetch).
 */
export default function PublicFloatingLayer({ floatingMenu, whatsapp }: Props) {
  const navVisible = floatingMenu.enabled && floatingMenu.items.length === 4;

  return (
    <>
      {navVisible ? <FloatingBottomNav config={{ enabled: floatingMenu.enabled, items: floatingMenu.items }} /> : null}
      <WhatsAppChatWidget settings={whatsapp} reserveBottomNavSpace={navVisible} />
    </>
  );
}
