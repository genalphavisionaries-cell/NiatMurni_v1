import Link from "next/link";

export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Get in touch
        </h2>
        <p className="mt-3 text-stone-600">
          For corporate bookings, group enquiries, or support, contact us.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <a
            href="mailto:info@niatmurniacademy.com"
            className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            info@niatmurniacademy.com
          </a>
          <Link
            href="/#classes"
            className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            View classes
          </Link>
        </div>
      </div>
    </section>
  );
}
