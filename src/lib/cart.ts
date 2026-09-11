import type { StoreProduct } from "@/convex/products";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  author: string;
  coverFrom: number;
  coverTo: number;
  category: string;
};

const STORAGE_KEY = "pdfstore-cart-v1";

type Listener = (items: CartItem[]) => void;

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable — cart stays in-memory for the session
  }
}

let items: CartItem[] = load();
const listeners = new Set<Listener>();

function emit() {
  save(items);
  for (const l of listeners) l(items);
}

function toCartItem(p: StoreProduct): CartItem {
  return {
    productId: p._id,
    title: p.title,
    price: p.price,
    author: p.author,
    coverFrom: p.coverFrom,
    coverTo: p.coverTo,
    category: p.category,
  };
}

export const cart = {
  get(): CartItem[] {
    return items;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  has(productId: string): boolean {
    return items.some((i) => i.productId === productId);
  },
  add(product: StoreProduct): boolean {
    if (cart.has(product._id)) return false;
    items = [...items, toCartItem(product)];
    emit();
    return true;
  },
  remove(productId: string) {
    items = items.filter((i) => i.productId !== productId);
    emit();
  },
  clear() {
    items = [];
    emit();
  },
  total(): number {
    return items.reduce((sum, i) => sum + i.price, 0);
  },
};
