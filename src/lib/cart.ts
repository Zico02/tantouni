import { useSyncExternalStore } from 'react';

// Shop cart: kept in this browser only (a convenience, the real order lives on the server).
export interface CartLine { id: string; size: string; qty: number }

const KEY = 'tantouni-cart';
const read = (): CartLine[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((l) => l && typeof l.id === 'string' && Number.isInteger(l.qty) && l.qty > 0) : [];
  } catch { return []; }
};

let lines: CartLine[] = read();
let open = false;
const subs = new Set<() => void>();
let snap = { lines, open };
const emit = () => {
  snap = { lines, open };
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode */ }
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export const cart = {
  add(id: string, size: string, qty = 1) {
    const l = lines.find((x) => x.id === id && x.size === size);
    lines = l
      ? lines.map((x) => (x === l ? { ...x, qty: Math.min(20, x.qty + qty) } : x))
      : [...lines, { id, size, qty }];
    emit();
  },
  setQty(i: number, qty: number) {
    lines = qty < 1 ? lines.filter((_, k) => k !== i) : lines.map((x, k) => (k === i ? { ...x, qty: Math.min(20, qty) } : x));
    emit();
  },
  remove(i: number) { lines = lines.filter((_, k) => k !== i); emit(); },
  clear() { lines = []; emit(); },
  /** drop lines whose product no longer exists */
  prune(ids: string[]) {
    const next = lines.filter((l) => ids.includes(l.id));
    if (next.length !== lines.length) { lines = next; emit(); }
  },
  open() { open = true; emit(); },
  close() { open = false; emit(); },
};

export const useCart = () => useSyncExternalStore(subscribe, () => snap);
