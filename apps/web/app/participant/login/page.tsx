"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormField, FormLabel, TextInput } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { participantLogin } from "@/lib/participant-api";
import { Lock, Mail, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/participant/certificates";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await participantLogin(email.trim(), password);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}
      <FormField>
        <FormLabel htmlFor="email" className="font-semibold text-[var(--text-primary)]">
          Email
        </FormLabel>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <TextInput
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            autoComplete="email"
          />
        </div>
      </FormField>
      <FormField>
        <FormLabel htmlFor="password" className="font-semibold text-[var(--text-primary)]">
          Password
        </FormLabel>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <TextInput
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            autoComplete="current-password"
          />
        </div>
      </FormField>
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60",
          "bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:ring-[var(--primary)]"
        )}
      >
        {loading ? "Signing in…" : "Sign in"}
        <ArrowRight className="h-5 w-5" />
      </button>
    </form>
  );
}

export default function ParticipantLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-xl">
          <div className="text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
              Participant portal
            </h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
              Sign in to view and download your certificates
            </p>
          </div>

          <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-xl bg-gray-100" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm font-medium text-[var(--text-secondary)]">
          <Link href="/participant" className="text-[var(--primary)] hover:underline">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
