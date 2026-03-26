"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type AdminSupportTicketDetail } from "@/lib/admin-api";

export function AdminSupportDetailClient({ id }: { id: string }) {
  const [ticket, setTicket] = useState<AdminSupportTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const ticketId = Number(id);

  const load = async () => {
    if (!Number.isFinite(ticketId) || ticketId <= 0) {
      setError("Invalid ticket ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSupportTicket(ticketId);
      setTicket(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleReply = async () => {
    const message = reply.trim();
    if (!message || !ticket || ticket.status === "closed") return;
    setSending(true);
    try {
      const r = await adminApi.replySupportTicket(ticket.id, message);
      setTicket({
        ...ticket,
        replies: [...ticket.replies, r],
      });
      setReply("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!ticket || ticket.status === "closed") return;
    setClosing(true);
    try {
      await adminApi.closeSupportTicket(ticket.id);
      setTicket({ ...ticket, status: "closed" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to close ticket.");
    } finally {
      setClosing(false);
    }
  };

  return (
    <section className="space-y-4">
      <Link href="/admin/support" className="inline-flex text-sm font-medium text-blue-700 hover:underline">
        ← Back to support tickets
      </Link>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading...</div>
      ) : error || !ticket ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Ticket not found."}</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{ticket.subject}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {ticket.participant?.full_name || "-"} ({ticket.participant?.email || "-"})
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  ticket.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                }`}
              >
                {ticket.status}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
              {ticket.replies.map((r) => (
                <div
                  key={r.id}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    r.sender === "admin"
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <p>{r.message}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder={ticket.status === "closed" ? "Ticket closed." : "Type your reply..."}
                disabled={ticket.status === "closed" || sending}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={ticket.status === "closed" || sending || reply.trim().length === 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Reply"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={ticket.status === "closed" || closing}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {closing ? "Closing..." : "Close Ticket"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

