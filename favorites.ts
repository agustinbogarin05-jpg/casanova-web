import { useSyncExternalStore } from "react";

/** Pedido del cliente (carrito): se guarda en el dispositivo (localStorage), sin cuenta. */
const KEY = "casanova:pedido";
const MAX_QTY = 99;

export interface CartItem {
  id: string;
  qty: number;
}

function read(): CartItem[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(v)) return [];
    return v.filter(
      (x): x is CartItem => typeof x?.id === "string" && Number.isInteger(x?.qty) && x.qty > 0,
    );
  } catch {
    return [];
  }
}

let items: CartItem[] = read();
let ids: string[] = items.map((i) => i.id);
let count = items.reduce((s, i) => s + i.qty, 0);
let panelOpen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function save(next: CartItem[]) {
  items = next;
  ids = next.map((i) => i.id);
  count = next.reduce((s, i) => s + i.qty, 0);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* modo privado: queda solo en memoria */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      items = read();
      ids = items.map((i) => i.id);
      count = items.reduce((s, i) => s + i.qty, 0);
      emit();
    }
  };
  window.addEventListener("storage", onStorage); // sincroniza pestañas abiertas
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const favorites = {
  /** Suma una unidad (o agrega el producto con cantidad 1). */
  add(id: string) {
    const cur = items.find((i) => i.id === id);
    save(cur ? items.map((i) => (i.id === id ? { ...i, qty: Math.min(i.qty + 1, MAX_QTY) } : i)) : [...items, { id, qty: 1 }]);
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) return save(items.filter((i) => i.id !== id));
    save(items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)));
  },
  remove: (id: string) => save(items.filter((i) => i.id !== id)),
  clear: () => save([]),
  setPanel(open: boolean) {
    panelOpen = open;
    emit();
  },
};

export const useFavoriteIds = (): string[] => useSyncExternalStore(subscribe, () => ids);
export const useCartItems = (): CartItem[] => useSyncExternalStore(subscribe, () => items);
export const useCartCount = (): number => useSyncExternalStore(subscribe, () => count);
export const useFavoritesPanel = (): boolean => useSyncExternalStore(subscribe, () => panelOpen);
