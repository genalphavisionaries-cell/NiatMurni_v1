"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { cart, openCart } = useCart();
  if (!cart) return null;

  return (
    <button
      type="button"
      onClick={openCart}
      className="fixed right-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-amber-600 p-4 text-white shadow-xl transition hover:bg-amber-700"
      aria-label="Open cart"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute -right-3 -top-3 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-amber-700">
          {cart.seat_count}
        </span>
      </div>
    </button>
  );
}
