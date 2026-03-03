import Link from "next/link";

const features = [
  {
    title: "KKM-recognised",
    description: "Our food handler programme is recognised by the Ministry of Health Malaysia.",
    icon: "✓",
  },
  {
    title: "Online & physical",
    description: "Choose the format that fits your schedule—attend in person or join live online.",
    icon: "✓",
  },
  {
    title: "Certificate & verification",
    description: "Receive a certificate with QR verification for employers and auditors.",
    icon: "✓",
  },
];

export default function ProgramsSection() {
  return (
    <section id="programs" className="scroll-mt-20 bg-stone-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            Why train with us
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">
            Professional food safety training designed to meet regulatory requirements and support your business.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold">
                {f.icon}
              </span>
              <h3 className="mt-4 font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-2 text-stone-600">{f.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center">
          <Link
            href="#classes"
            className="font-medium text-amber-600 hover:underline"
          >
            See upcoming classes →
          </Link>
        </p>
      </div>
    </section>
  );
}
