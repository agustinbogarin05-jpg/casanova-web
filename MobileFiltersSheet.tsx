import { useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { CategoryIcon } from "./CategoryIcon";

export type SortKey = "order" | "price_asc" | "price_desc" | "name";
export const SORT_LABELS: Record<SortKey, string> = {
  order: "Orden sugerido",
  price_asc: "Menor precio",
  price_desc: "Mayor precio",
  name: "Nombre (A–Z)",
};

interface MobileFiltersSheetProps {
  categories: Category[];
  counts: Map<string, number>;
  totalCount: number;
  activeCategoryId: string | null;
  onCategory: (slug: string | null) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (v: boolean) => void;
  onlyPromo: boolean;
  setOnlyPromo: (v: boolean) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  resultsCount: number;
  activeCount: number;
  onReset: () => void;
}

const bigBtn =
  "flex min-h-12 items-center gap-2.5 rounded-xl border px-4 text-left text-[15px] font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98]";
const on = "border-brand bg-brand text-cream";
const off = "border-beige bg-cream text-brand";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-brand">{title}</h3>
      {children}
    </section>
  );
}

/** Phone/tablet filters: a bottom sheet with large thumb-friendly buttons. */
export function MobileFiltersSheet(props: MobileFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const { categories, counts, activeCategoryId, sort, onlyAvailable, onlyPromo } = props;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        data-testid="catalog-mobile-filters-trigger"
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-beige bg-cream px-4 text-[15px] font-semibold text-brand transition-colors duration-200 active:bg-beige md:hidden"
      >
        <SlidersHorizontal className="size-4 text-teal" aria-hidden="true" />
        Filtrar y ordenar
        {props.activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-cream">
            {props.activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[88dvh] gap-0 rounded-t-3xl border-t border-beige bg-cream p-0"
        data-testid="catalog-mobile-filters-sheet"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-beige" aria-hidden="true" />
        <SheetHeader className="px-5 pb-2 pt-3">
          <SheetTitle className="text-left text-2xl font-bold text-brand">Filtrar y ordenar</SheetTitle>
          <SheetDescription className="text-left text-sm text-ink">Elegí lo que buscás y tocá “Ver productos”.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 pb-6 pt-3">
          <Group title="Ordenar por">
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={sort === k}
                  onClick={() => props.setSort(k)}
                  data-testid={`mobile-sort-option-${k}`}
                  className={cn(bigBtn, "justify-center text-center", sort === k ? on : off)}
                >
                  {SORT_LABELS[k]}
                </button>
              ))}
            </div>
          </Group>

          <Group title="Categoría">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                aria-pressed={!activeCategoryId}
                onClick={() => props.onCategory(null)}
                data-testid="mobile-filter-category-all"
                className={cn(bigBtn, "rounded-full", !activeCategoryId ? on : off)}
              >
                Todas <span className="text-sm opacity-80">{props.totalCount}</span>
              </button>
              {categories.map((c) => {
                const active = activeCategoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => props.onCategory(active ? null : c.slug)}
                    data-testid={`mobile-filter-category-${c.slug}`}
                    className={cn(bigBtn, "rounded-full", active ? on : off)}
                  >
                    <CategoryIcon icon={c.icon} className="size-4 text-teal" />
                    {c.name}
                    <span className="text-sm opacity-80">{counts.get(c.id) ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </Group>

          <Group title="Disponibilidad y promociones">
            <div className="grid gap-2.5">
              {(
                [
                  ["available", "Solo productos disponibles", onlyAvailable, props.setOnlyAvailable],
                  ["promo", "Solo con promoción o descuento", onlyPromo, props.setOnlyPromo],
                ] as const
              ).map(([key, label, value, set]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={value}
                  onClick={() => set(!value)}
                  data-testid={`mobile-filter-${key}-toggle`}
                  className={cn(bigBtn, "justify-between", value ? "border-teal bg-beige text-brand" : off)}
                >
                  {label}
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md border-2",
                      value ? "border-teal bg-teal text-cream" : "border-beige",
                    )}
                    aria-hidden="true"
                  >
                    {value && <Check className="size-4" />}
                  </span>
                </button>
              ))}
            </div>
          </Group>

          <Group title="Precio (ARS)">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Desde"
                aria-label="Precio mínimo"
                value={props.minPrice}
                onChange={(e) => props.setMinPrice(e.target.value)}
                data-testid="mobile-filter-price-min-input"
                className="h-12 rounded-xl text-base"
              />
              <span className="text-ink">–</span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Hasta"
                aria-label="Precio máximo"
                value={props.maxPrice}
                onChange={(e) => props.setMaxPrice(e.target.value)}
                data-testid="mobile-filter-price-max-input"
                className="h-12 rounded-xl text-base"
              />
            </div>
          </Group>
        </div>

        <div className="flex gap-3 border-t border-beige bg-cream px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <button
            type="button"
            onClick={props.onReset}
            data-testid="mobile-filters-reset-button"
            className="h-13 rounded-xl border border-beige px-5 text-base font-semibold text-brand transition-colors active:bg-beige"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            data-testid="mobile-filters-apply-button"
            className="h-13 flex-1 rounded-xl bg-brand text-base font-bold text-cream transition-transform active:scale-[0.98]"
          >
            Ver {props.resultsCount} {props.resultsCount === 1 ? "producto" : "productos"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
