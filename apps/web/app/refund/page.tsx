import type { Metadata } from "next";
import { PublicSiteShell } from "@/components/public";

export const metadata: Metadata = {
  title: "Refund Policy | Niat Murni Academy",
  description: "Refund policy for Niat Murni Academy.",
};

export default async function RefundPage() {
  return (
    <PublicSiteShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-stone-900">Refund Policy</h1>
        <p className="mt-4 text-stone-600 leading-relaxed">
          Refund and cancellation details can be published here. Contact the academy
          using the footer details for specific cases.
        </p>
      </div>
    </PublicSiteShell>
  );
}
