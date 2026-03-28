/**
 * Public widget settings from Laravel GET /api/public/settings.
 */

import { apiUrl, getApiBase } from "./config";

export type PublicWhatsAppSettings = {
  enabled: boolean;
  phone: string;
  welcome_text: string;
  default_message: string;
  helper_text: string;
  auto_open_delay_ms: number;
};

export type PublicSettingsPayload = {
  whatsapp: PublicWhatsAppSettings;
};

const defaults: PublicSettingsPayload = {
  whatsapp: {
    enabled: false,
    phone: "",
    welcome_text: "",
    default_message: "",
    helper_text: "",
    auto_open_delay_ms: 0,
  },
};

export async function fetchPublicSettings(): Promise<PublicSettingsPayload | null> {
  if (!getApiBase()) return null;
  const url = apiUrl("/api/public/settings");
  if (!url) return null;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: PublicSettingsPayload };
    const data = json?.data;
    if (!data?.whatsapp) return null;
    return {
      whatsapp: {
        enabled: !!data.whatsapp.enabled,
        phone: String(data.whatsapp.phone ?? "").replace(/\D/g, ""),
        welcome_text: String(data.whatsapp.welcome_text ?? ""),
        default_message: String(data.whatsapp.default_message ?? ""),
        helper_text: String(data.whatsapp.helper_text ?? ""),
        auto_open_delay_ms: Math.max(
          0,
          Number.isFinite(Number(data.whatsapp.auto_open_delay_ms))
            ? Number(data.whatsapp.auto_open_delay_ms)
            : 0
        ),
      },
    };
  } catch {
    return null;
  }
}

export function defaultPublicSettings(): PublicSettingsPayload {
  return { ...defaults, whatsapp: { ...defaults.whatsapp } };
}
