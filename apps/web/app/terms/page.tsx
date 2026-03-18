import type { Metadata } from "next";
import { PublicSiteShell } from "@/components/public";

export const metadata: Metadata = {
  title: "Terms & Conditions | Niat Murni Academy",
  description: "Terms and conditions for Niat Murni Academy.",
};

export default async function TermsPage() {
  return (
    <PublicSiteShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-stone-900">Terms & Conditions</h1>
        <p className="mt-4 text-stone-600 leading-relaxed">
          Terms content can be added here. For course-specific terms, refer to your
          registration confirmation or contact the academy.
        </p>
      </div>
    </PublicSiteShell>
  );
}
