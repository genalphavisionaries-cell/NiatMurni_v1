"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { cart, openCart } = useCart();
  if (!cart) return null;
  const subtotal = cart.price_per_seat * cart.seat_count;

  return (
    <div className="fixed right-4 top-1/2 z-40 w-[290px] -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative rounded-lg bg-blue-50 p-2 text-blue-700">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {cart.seat_count}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{cart.class_title}</p>
          <p className="mt-1 text-xs text-slate-600">
            {cart.seat_count} seat(s) × RM {cart.price_per_seat.toFixed(2)}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Subtotal: RM {subtotal.toFixed(2)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={openCart}
        className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        aria-label="Checkout securely"
      >
        Checkout Securely
      </button>
    </div>
  );
}
