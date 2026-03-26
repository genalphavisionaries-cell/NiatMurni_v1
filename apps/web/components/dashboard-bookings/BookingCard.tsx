"use client";

import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import type { ParticipantBookingListItem } from "@/lib/api";

type Props = {
  booking: ParticipantBookingListItem;
};

export function BookingCard({ booking }: Props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{booking.class_name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {booking.class_date || "-"} {booking.class_time ? `• ${booking.class_time}` : ""}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Payment: {booking.payment_status}</p>
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

