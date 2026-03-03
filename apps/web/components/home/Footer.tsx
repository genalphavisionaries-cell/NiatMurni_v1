import Link from "next/link";
import type { HomepageSettings } from "@/lib/homepage-settings";

type FooterProps = {
  settings: Pick<HomepageSettings, "footerColumns" | "footerBottom" | "siteName">;
};

export default function Footer({ settings }: FooterProps) {
  const { footerColumns, footerBottom, siteName } = settings;

  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-semibold text-white">{siteName}</p>
            <p className="mt-2 text-sm">
              Professional food safety training and KKM-recognised certification.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) =>
                  link.external ? (
                    <li key={link.href + link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="text-sm transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-stone-700 pt-8 text-center text-sm">
          {footerBottom}
        </div>
      </div>
    </footer>
  );
}
