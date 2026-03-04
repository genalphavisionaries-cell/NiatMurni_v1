import Link from "next/link";

/** Demo programme cards — admin can drive from API/settings later. */
const demoPrograms = [
  {
    id: "1",
    name: "KKM Food Handler Certification",
    description: "Full programme recognised by the Ministry of Health. Covers food safety principles, hygiene, and compliance.",
    duration: "1 day",
    mode: "Online & physical",
  },
  {
    id: "2",
    name: "Refresher Course",
    description: "For those renewing certification. Updated content and quick assessment.",
    duration: "Half day",
    mode: "Online",
  },
];

export default function ProgramsSection() {
  return (
    <section id="programs-list" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Our programmes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Structured courses designed to meet regulatory requirements and industry standards.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {demoPrograms.map((prog) => (
            <div
              key={prog.id}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition hover:shadow-card-hover"
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-700">
                  {prog.duration}
                </span>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {prog.mode}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{prog.name}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{prog.description}</p>
              <Link
                href="#classes"
                className="mt-6 inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                View upcoming classes
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center">
          <Link
            href="#classes"
            className="inline-flex rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            See all upcoming classes
          </Link>
        </p>
      </div>
    </section>
  );
}
