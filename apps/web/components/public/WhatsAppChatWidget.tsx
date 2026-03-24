"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { PublicWhatsAppSettings } from "@/lib/public-settings";

const WA_GREEN = "#25D366";

function IconWhatsAppLarge() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  settings: PublicWhatsAppSettings;
  /** When the bottom floating nav is visible, raise the button to avoid overlap */
  reserveBottomNavSpace: boolean;
};

export default function WhatsAppChatWidget({ settings, reserveBottomNavSpace }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(settings.default_message);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const panelId = useId();
  const prefillId = useId();
  const autoOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMessage(settings.default_message);
  }, [settings.default_message]);

  const openChat = useCallback(() => {
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    const onExternalOpen = () => openChat();
    window.addEventListener("open-whatsapp-chat", onExternalOpen);
    return () => window.removeEventListener("open-whatsapp-chat", onExternalOpen);
  }, [openChat]);

  useEffect(() => {
    const delay = settings.auto_open_delay_ms;
    if (!settings.enabled || !delay) return;
    autoOpenTimer.current = setTimeout(() => setOpen(true), delay);
    return () => {
      if (autoOpenTimer.current) clearTimeout(autoOpenTimer.current);
    };
  }, [settings.enabled, settings.auto_open_delay_ms]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", onKey);
    const t = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeChat]);

  if (!settings.enabled || !settings.phone) return null;

  const startChat = () => {
    const text = encodeURIComponent(message.trim() || settings.default_message);
    const url = `https://wa.me/${settings.phone}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const bottomOffset = reserveBottomNavSpace
    ? "calc(5.25rem + env(safe-area-inset-bottom, 0px))"
    : "calc(1rem + env(safe-area-inset-bottom, 0px))";

  return (
    <div
      className="fixed right-4 z-[100] flex flex-col items-end"
      style={{ bottom: bottomOffset }}
    >
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby={titleId}
        className={`mb-3 w-[320px] max-w-[calc(100vw-2rem)] origin-bottom-right rounded-xl border border-slate-200 bg-white shadow-lg transition duration-200 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3" style={{ backgroundColor: WA_GREEN }}>
          <div className="min-w-0 text-white">
            <h2 id={titleId} className="text-base font-semibold leading-tight">
              WhatsApp
            </h2>
            {settings.welcome_text ? (
              <p className="mt-0.5 text-xs text-white/90">{settings.welcome_text}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeChat}
            className="rounded-md p-1 text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close chat panel"
          >
            <IconClose />
          </button>
        </div>
        <div className="space-y-3 px-4 py-3">
          {settings.helper_text ? (
            <p className="text-xs text-slate-600">{settings.helper_text}</p>
          ) : (
            <p className="text-xs text-slate-600">Send us a message and we&apos;ll reply on WhatsApp.</p>
          )}
          <label className="block text-xs font-medium text-slate-700" htmlFor={prefillId}>
            Your message
          </label>
          <textarea
            ref={textareaRef}
            id={prefillId}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={startChat}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            style={{ backgroundColor: WA_GREEN }}
            aria-label="Start WhatsApp chat in a new tab"
          >
            Start Chat
          </button>
        </div>
      </div>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
        style={{ backgroundColor: WA_GREEN }}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <IconWhatsAppLarge />
      </button>
    </div>
  );
}
