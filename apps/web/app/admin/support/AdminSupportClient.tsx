"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type AdminSupportTicketListItem } from "@/lib/admin-api";

export function AdminSupportClient() {
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [tickets, setTickets] = useState<AdminSupportTicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getSupportTickets({ status });
        if (!cancelled) setTickets(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load support tickets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Support Tickets</h1>
        <p className="mt-1 text-sm text-slate-600">Review participant support requests and reply.</p>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setStatus("open")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status === "open" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => setStatus("closed")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            status === "closed" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          Closed
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No {status} tickets found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Participant</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 text-slate-700">{ticket.subject}</td>
                  <td className="px-4 py-3 text-slate-700">{ticket.participant?.full_name || "-"}</td>
                  <td className="px-4 py-3 text-slate-700 capitalize">{ticket.status}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/support/${ticket.id}`} className="text-sm font-medium text-blue-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

