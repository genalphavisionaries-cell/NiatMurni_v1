"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FormField, FormLabel, TextInput } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { Lock, Mail, ArrowRight } from "lucide-react";

const DEMO_EMAIL = "admin@niatmurni.my";
const DEMO_PASSWORD = "NiatMurniAdmin!";

function setAdminSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (email.trim() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setAdminSession();
        router.push(redirect);
        router.refresh();
        return;
      }
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      <FormField>
        <FormLabel htmlFor="email">Email</FormLabel>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <TextInput
            id="email"
            type="email"
            placeholder="admin@niatmurni.my"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            autoComplete="email"
          />
        </div>
      </FormField>
      <FormField>
        <FormLabel htmlFor="password">Password</FormLabel>
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
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
        />
        <span className="text-sm text-gray-600">Remember me</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-60"
        )}
      >
        {loading ? "Signing in…" : "Sign in"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100/80 px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xl shadow-gray-200/20">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-gray-900">Niat Murni Admin</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
          </div>

          <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-lg bg-gray-100" />}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-gray-500">
            Can&apos;t log in? Ensure backend admin user exists (e.g.{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5">php artisan admin:ensure-admin</code>).
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="font-medium text-gray-700 hover:text-gray-900">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
