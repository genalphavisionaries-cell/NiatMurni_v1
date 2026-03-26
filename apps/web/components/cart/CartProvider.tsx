"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { CartButton } from "./CartButton";
import { CartModal } from "./CartModal";

export type CartItem = {
  class_session_id: number;
  seat_count: number;
  class_title: string;
  price_per_seat: number;
};

type CartContextValue = {
  cart: CartItem | null;
  addToCart: (item: Omit<CartItem, "seat_count">, seatCount: number) => void;
  updateSeatCount: (seatCount: number) => void;
  clearCart: () => void;
  removeItem: () => void;
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
  replacementNotice: string | null;
  dismissReplacementNotice: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [replacementNotice, setReplacementNotice] = useState<string | null>(null);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addToCart: (item, seatCount) => {
        if (seatCount <= 0) {
          return;
        }
        setCart((prev) => {
          if (prev) {
            setReplacementNotice("Your previous selection was replaced");
          } else {
            setReplacementNotice(null);
          }
          return {
            ...item,
            seat_count: Math.max(1, seatCount),
          };
        });
        setIsOpen(true);
      },
      updateSeatCount: (seatCount) => {
        setCart((prev) => (prev ? { ...prev, seat_count: Math.max(1, seatCount) } : prev));
      },
      clearCart: () => {
        setCart(null);
        setReplacementNotice(null);
      },
      removeItem: () => {
        setCart(null);
        setReplacementNotice(null);
      },
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      isOpen,
      replacementNotice,
      dismissReplacementNotice: () => setReplacementNotice(null),
    }),
    [cart, isOpen, replacementNotice]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartButton />
      <CartModal />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
