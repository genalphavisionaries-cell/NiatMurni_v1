"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createSupportTicket,
  getSupportTickets,
  replySupportTicket,
  type SupportTicket,
  type SupportTicketReply,
} from "@/lib/api";
import { SupportChat } from "@/components/dashboard-support/SupportChat";

export default function DashboardSupportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSupportTickets();
        if (cancelled) return;
        setTickets(data);
        setSelectedId(data[0]?.id ?? null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load support tickets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? null,
    [tickets, selectedId]
  );

  const handleCreate = async () => {
    if (!subject.trim() || !message.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const newTicket = await createSupportTicket({ subject: subject.trim(), message: message.trim() });
      setTickets((prev) => [newTicket, ...prev]);
      setSelectedId(newTicket.id);
      setSubject("");
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async (ticketId: number, msg: string): Promise<SupportTicketReply> => {
    const reply = await replySupportTicket(ticketId, msg);
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, replies: [...ticket.replies, reply] } : ticket
      )
    );
    return reply;
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Support</h2>
        <p className="mt-1 text-sm text-slate-600">Create tickets and chat with support team.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">New Ticket</h3>
            <div className="mt-3 space-y-2">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe your issue..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !subject.trim() || !message.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Tickets</h3>
            {loading ? (
              <p className="mt-3 text-sm text-slate-500">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No support tickets yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedId(ticket.id)}
                    className={`w-full rounded-lg border p-3 text-left ${
                      selectedId === ticket.id
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">{ticket.subject}</p>
                    <p className="mt-1 text-xs text-slate-500 capitalize">{ticket.status}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {error ? <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {selectedTicket ? (
            <SupportChat
              ticket={selectedTicket}
              onReply={(msg) => handleReply(selectedTicket.id, msg)}
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              Select a ticket to view replies.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

