"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { registerForClass } from "@/lib/api";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    nric_passport: "",
    phone: "",
    email: "",
    class_session_id: id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { redirect_url } = await registerForClass({
        ...form,
        class_session_id: id,
      });
      window.location.href = redirect_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <Link href={`/classes/${id}`} className="text-sm text-amber-600 hover:underline">← Back to class</Link>
        <h1 className="text-xl font-semibold text-stone-900 mt-2">Register for class</h1>
      </header>

      <section className="max-w-md mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Full name *</span>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">NRIC / Passport *</span>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm"
              value={form.nric_passport}
              onChange={(e) => setForm((f) => ({ ...f, nric_passport: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Phone</span>
            <input
              type="tel"
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input
              type="email"
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-amber-600 px-4 py-3 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {submitting ? "Creating booking…" : "Continue to payment"}
          </button>
        </form>
      </section>
    </main>
  );
}
