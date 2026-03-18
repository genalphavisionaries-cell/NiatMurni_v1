import type { Metadata } from "next";
import { PublicSiteShell } from "@/components/public";

export const metadata: Metadata = {
  title: "Privacy Policy | Niat Murni Academy",
  description: "Privacy policy for Niat Murni Academy.",
};

export default async function PrivacyPage() {
  return (
    <PublicSiteShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-stone-900">Privacy Policy</h1>
        <p className="mt-4 text-stone-600 leading-relaxed">
          Policy content can be added here or managed via a future CMS page builder.
          For enquiries, use the contact details in the site footer.
        </p>
      </div>
    </PublicSiteShell>
  );
}
