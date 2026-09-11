import { useSyncExternalStore } from "react";
import { cart } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";

/** React binding for the framework-agnostic cart store. */
export function useCart(): {
  items: CartItem[];
  count: number;
  total: number;
  has: (productId: string) => boolean;
} {
  const items = useSyncExternalStore(cart.subscribe, cart.get, cart.get);
  return {
    items,
    count: items.length,
    total: items.reduce((sum, i) => sum + i.price, 0),
    has: (productId: string) => items.some((i) => i.productId === productId),
  };
}
