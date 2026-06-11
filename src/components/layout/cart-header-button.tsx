"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/features/cart/context/cart-context";

export function CartHeaderButton() {
  const { toggleCart, itemCount } = useCart();

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
      aria-label={
        itemCount > 0
          ? `Carrito — ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`
          : "Abrir carrito"
      }
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[0.6rem] font-bold leading-none text-white tabular-nums">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
