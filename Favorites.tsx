import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cartWhatsappUrl, categoryMap, formatPrice, useCatalog } from "@/lib/catalog";
import { favorites, useCartCount, useCartItems, useFavoriteIds, useFavoritesPanel } from "@/lib/favorites";
import type { Product } from "@/lib/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProductMedia } from "./ProductMedia";
import { WhatsAppButton } from "./WhatsAppButton";

export function FavoriteButton({ product, size = "sm", className }: { product: Product; size?: "sm" | "lg"; className?: string }) {
  const active = useFavoriteIds().includes(product.id);
  const soldOut = product.availability === "out_of_stock";
  return (
    <button
      type="button"
      disabled={soldOut}
      aria-label={soldOut ? `${product.name}: sin stock` : `Agregar ${product.name} al pedido`}
      title={soldOut ? "Sin stock" : "Agregar al pedido"}
      data-testid={`favorite-button-${product.id}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        favorites.add(product.id);
        toast.success("Agregado a tu pedido", { action: { label: "Ver pedido", onClick: () => favorites.setPanel(true) } });
      }}
      className={cn(
        "flex items-center justify-center rounded-full border bg-cream transition-[transform,border-color] duration-200 active:scale-90 disabled:opacity-40",
        active ? "border-teal" : "border-beige hover:border-teal",
        size === "lg" ? "size-12" : "size-10",
        className,
      )}
    >
      <ShoppingCart
        className={cn(size === "lg" ? "size-5" : "size-[18px]", "transition-colors", active ? "fill-teal/20 text-teal" : "text-brand")}
        aria-hidden="true"
      />
    </button>
  );
}

/** Opens the favorites panel; shows the count. */
export function FavoritesTrigger({ className, label = false }: { className?: string; label?: boolean }) {
  const count = useCartCount();
  return (
    <button
      type="button"
      onClick={() => favorites.setPanel(true)}
      aria-label={`Mi pedido (${count})`}
      data-testid={label ? "favorites-floating-button" : "header-favorites-button"}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl border border-beige bg-cream text-brand transition-[background-color,border-color] duration-200 hover:border-teal hover:bg-beige",
        label ? "h-12 rounded-full px-5 text-[15px] font-semibold" : "size-11",
        className,
      )}
    >
      <ShoppingCart className={cn("size-5", count ? "text-teal" : "text-brand")} aria-hidden="true" />
      {label && <span>Mi pedido</span>}
      {count > 0 && (
        <span
          className={cn(
            "flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-cream",
            label ? "h-6 min-w-6" : "absolute -right-1.5 -top-1.5 h-5",
          )}
          data-testid="favorites-count"
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function FavoritesSheet() {
  const open = useFavoritesPanel();
  const cart = useCartItems();
  const { data } = useCatalog();
  const byId = new Map((data?.products ?? []).map((p) => [p.id, p]));
  const cats = categoryMap(data?.categories ?? []);
  const items = cart
    .map((c) => ({ product: byId.get(c.id), qty: c.qty }))
    .filter((i): i is { product: Product; qty: number } => Boolean(i.product)); // ignora productos eliminados
  const units = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + (i.product.price ?? 0) * i.qty, 0);
  const settings = data?.settings;

  return (
    <Sheet open={open} onOpenChange={(o) => favorites.setPanel(o)}>
      <SheetContent side="right" className="w-[92vw] gap-0 bg-cream p-0 sm:max-w-md" data-testid="favorites-sheet">
        <SheetHeader className="border-b border-beige px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-left text-2xl font-bold text-brand">
            <ShoppingCart className="size-5 text-teal" aria-hidden="true" /> Mi pedido
          </SheetTitle>
          <SheetDescription className="text-left text-sm text-ink">
            Armá tu lista y envianosla completa por WhatsApp en un solo mensaje.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-8" data-testid="favorites-empty">
              <p className="text-lg font-bold text-brand">Todavía no agregaste productos.</p>
              <p className="text-base text-ink">Tocá el carrito de cualquier producto para sumarlo a tu pedido.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map(({ product: p, qty }) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-beige p-2.5" data-testid={`favorite-item-${p.id}`}>
                  <Link
                    to={`/producto/${p.id}`}
                    onClick={() => favorites.setPanel(false)}
                    className="group size-16 shrink-0 overflow-hidden rounded-xl"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <ProductMedia product={p} category={cats.get(p.category_id)} size="xs" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/producto/${p.id}`}
                      onClick={() => favorites.setPanel(false)}
                      className="line-clamp-2 text-[15px] font-bold leading-snug text-brand underline-offset-4 hover:underline hover:decoration-teal"
                      data-testid={`favorite-item-link-${p.id}`}
                    >
                      {p.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-semibold text-ink">{p.price != null ? formatPrice(p.price * qty) : "Consultar precio"}</p>
                    <div className="mt-1.5 inline-flex items-center rounded-lg border border-beige">
                      <button type="button" onClick={() => favorites.setQty(p.id, qty - 1)} aria-label={`Restar una unidad de ${p.name}`} data-testid={`cart-minus-${p.id}`} className="flex size-8 items-center justify-center text-brand hover:bg-beige">
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-7 text-center text-sm font-bold text-brand" data-testid={`cart-qty-${p.id}`}>{qty}</span>
                      <button type="button" onClick={() => favorites.setQty(p.id, qty + 1)} aria-label={`Sumar una unidad de ${p.name}`} data-testid={`cart-plus-${p.id}`} className="flex size-8 items-center justify-center text-brand hover:bg-beige">
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => favorites.remove(p.id)}
                    aria-label={`Quitar ${p.name} del pedido`}
                    data-testid={`favorite-item-remove-${p.id}`}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-brand transition-colors hover:bg-beige"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-2.5 border-t border-beige px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {total > 0 && (
              <p className="flex items-center justify-between text-base font-bold text-brand" data-testid="cart-total">
                <span>Total estimado</span>
                <span>{formatPrice(total)}</span>
              </p>
            )}
            <WhatsAppButton
              settings={settings}
              href={cartWhatsappUrl(settings, items)}
              size="md"
              className="h-13 w-full text-base"
              testId="favorites-whatsapp-button"
            >
              Enviar pedido por WhatsApp ({units})
            </WhatsAppButton>
            <button
              type="button"
              onClick={() => {
                favorites.clear();
                toast("Pedido vaciado");
              }}
              data-testid="favorites-clear-button"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-brand transition-colors hover:bg-beige"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Vaciar pedido
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
