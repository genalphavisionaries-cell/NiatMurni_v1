import Link from "next/link";
import { cmsString } from "@/lib/public-cms";

const DEFAULT_EMAIL = "info@niatmurniacademy.com";

export type ContactSectionProps = {
  /** From CMS Website settings when set */
  email?: string | null;
  phone?: string | null;
};

export default function ContactSection(props: ContactSectionProps = {}) {
  const { email, phone } = props;
  const mail = cmsString(email) ?? DEFAULT_EMAIL;
  const tel = cmsString(phone);

  return (
    <section id="contact" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Get in touch
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          For corporate bookings, group enquiries, or support, contact us.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={`mailto:${mail}`}
            className="inline-flex rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-slate-400 hover:bg-slate-50"
          >
            {mail}
          </a>
          {tel ? (
            <a
              href={`tel:${tel.replace(/\s/g, "")}`}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-slate-400 hover:bg-slate-50"
            >
              {tel}
            </a>
          ) : null}
          <Link
            href="/#classes"
            className="inline-flex rounded-xl bg-primary-500 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 active:scale-[0.98]"
          >
            View classes
          </Link>
        </div>
      </div>
    </section>
  );
}
