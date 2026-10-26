import { useQuery } from "@tanstack/react-query";
import raw from "@/data/catalog.json";
import type { Availability, Catalog, Category, Product, Settings } from "@/lib/types";

export const CATALOG_KEY = ["catalog"] as const;

const catalog = {
  ...(raw as unknown as Catalog),
  products: (raw as unknown as Catalog).products.filter((p) => p.published),
} as Catalog;

/** Catálogo estático: los datos viven en src/data/catalog.json (sin servidor). */
export function useCatalog() {
  return useQuery({ queryKey: CATALOG_KEY, queryFn: async () => catalog, initialData: catalog, staleTime: Infinity });
}

/** Lowercase + strip accents so "camara" finds "Cámara" and "iluminacion" finds "Iluminación". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function matchesQuery(product: Product, category: Category | undefined, query: string): boolean {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = normalize(
    [product.name, product.short_description, category?.name ?? "", product.promo_label, ...product.tags].join(" "),
  );
  return tokens.every((t) => haystack.includes(t));
}

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const arsCents = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (n: number) => ars.format(n);
/** Installment amounts keep cents so count × installment adds up to the real price. */
export const formatInstallment = (n: number) => (Number.isInteger(n) ? ars.format(n) : arsCents.format(n));

export function discountPercent(p: Product): number | null {
  if (p.price == null || p.previous_price == null || p.previous_price <= p.price) return null;
  return Math.round((1 - p.price / p.previous_price) * 100);
}

export function installmentInfo(p: Product, s: Settings): { count: number; amount: number } | null {
  if (!s.installments_enabled || !p.installments_eligible || p.price == null || p.price <= 0) return null;
  return { count: s.installments_count, amount: Math.round((p.price / s.installments_count) * 100) / 100 };
}

export function cashPrice(p: Product, s: Settings): number | null {
  if (!s.cash_discount_enabled || !p.cash_discount_eligible || p.price == null || s.cash_discount_percent <= 0) return null;
  return Math.round(p.price * (1 - s.cash_discount_percent / 100));
}

export const AVAILABILITY: Record<Availability, { label: string; dot: string; text: string }> = {
  in_stock: { label: "Disponible", dot: "bg-teal", text: "text-ink" },
  low_stock: { label: "Últimas unidades", dot: "bg-brand", text: "text-ink" },
  on_request: { label: "Consultar disponibilidad", dot: "border-2 border-teal bg-cream", text: "text-ink" },
  out_of_stock: { label: "Sin stock", dot: "border-2 border-ink bg-cream", text: "text-ink" },
};

export const isAvailable = (p: Product) => p.availability === "in_stock" || p.availability === "low_stock";
export const hasPromo = (p: Product) => Boolean(p.promo_label) || discountPercent(p) !== null;

export function productMessage(name: string): string {
  return `¡Hola, CASANOVA! Me interesa el producto ${name}. ¿Me pasan más información y disponibilidad?`;
}

/** wa.me works on desktop (WhatsApp Web / app) and mobile. With no number configured yet,
 *  wa.me/?text= still opens WhatsApp with the message so the user can pick the contact. */
export function whatsappUrl(settings: Settings | undefined, productName?: string): string {
  const text = productName ? productMessage(productName) : (settings?.whatsapp_default_message ?? productMessage(""));
  const number = settings?.whatsapp_number ?? "";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** "Los más elegidos": manual order (best_seller_rank) unless sorting by real sales data is enabled. */
/** Un solo mensaje de WhatsApp con todo el pedido (cantidad, nombre, precio y total estimado). */
export function cartWhatsappUrl(settings: Settings | undefined, items: { product: Product; qty: number }[]): string {
  const NL = String.fromCharCode(10);
  const lines = items.map(({ product: p, qty }) => "• " + qty + " × " + p.name + (p.price != null ? " (" + formatPrice(p.price * qty) + ")" : ""));
  const total = items.reduce((sum, { product: p, qty }) => sum + (p.price ?? 0) * qty, 0);
  const text = [
    "¡Hola, CASANOVA! Quiero hacer este pedido:",
    ...lines,
    ...(total > 0 ? ["Total estimado: " + formatPrice(total)] : []),
    "¿Me confirman disponibilidad y forma de entrega?",
  ].join(NL);
  return "https://wa.me/" + (settings?.whatsapp_number ?? "") + "?text=" + encodeURIComponent(text);
}

/** Share a product with a friend: wa.me without a number lets the user pick any contact (phone, tablet, desktop). */
export function shareProductUrl(productName: string, productUrl: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`Mirá este producto de CASANOVA: ${productName} ${productUrl}`)}`;
}

export function getBestSellers(products: Product[], settings: Settings): Product[] {
  const list = products.filter((p) => p.best_seller);
  if (settings.best_sellers_sort_by_sales && list.some((p) => p.units_sold != null)) {
    return [...list].sort((a, b) => (b.units_sold ?? -1) - (a.units_sold ?? -1));
  }
  return [...list].sort((a, b) => a.best_seller_rank - b.best_seller_rank || a.order - b.order);
}

/** Confirmed relations first (related_ids), then products of the same category. */
export function getRelated(product: Product, products: Product[], limit = 4): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const explicit = product.related_ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.category_id === product.category_id && !product.related_ids.includes(p.id),
  );
  return [...explicit, ...sameCategory].slice(0, limit);
}

export function categoryMap(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((c) => [c.id, c]));
}
