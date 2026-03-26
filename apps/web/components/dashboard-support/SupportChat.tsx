"use client";

import { useState } from "react";
import type { SupportTicket, SupportTicketReply } from "@/lib/api";

type Props = {
  ticket: SupportTicket;
  onReply: (message: string) => Promise<SupportTicketReply>;
};

export function SupportChat({ ticket, onReply }: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending || ticket.status === "closed") return;
    setError(null);
    setSending(true);
    try {
      await onReply(trimmed);
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{ticket.subject}</h3>
          <p className="text-xs text-slate-500">Status: {ticket.status}</p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            ticket.status === "closed" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {ticket.status}
        </span>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
        {ticket.replies.map((reply) => (
          <div
            key={reply.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              reply.sender === "participant"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-white text-slate-800 border border-slate-200"
            }`}
          >
            <p>{reply.message}</p>
          </div>
        ))}
        {ticket.replies.length === 0 && <p className="text-sm text-slate-500">No replies yet.</p>}
      </div>

      <div className="mt-3 space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={ticket.status === "closed" ? "This ticket is closed." : "Type your reply..."}
          disabled={ticket.status === "closed" || sending}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          type="button"
          onClick={handleSend}
          disabled={ticket.status === "closed" || sending || message.trim().length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}

