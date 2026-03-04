import Link from "next/link";
import type { HomepageSettings } from "@/lib/homepage-settings";

type FooterProps = {
  settings: Pick<HomepageSettings, "footerColumns" | "footerBottom" | "siteName">;
};

export default function Footer({ settings }: FooterProps) {
  const { footerColumns, footerBottom, siteName } = settings;

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-semibold text-white">{siteName}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Professional food safety training and KKM-recognised certification.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) =>
                  link.external ? (
                    <li key={link.href + link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 transition hover:text-primary-400"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 transition hover:text-primary-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
          {footerBottom}
        </div>
      </div>
    </footer>
  );
}
