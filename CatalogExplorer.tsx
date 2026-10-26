import { useMemo, useState } from "react";
import { PackageSearch, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPromo, isAvailable, matchesQuery } from "@/lib/catalog";
import { useCatalogParams } from "@/lib/useCatalogParams";
import type { Category, Product, Settings } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { SectionHeading } from "./HomeSections";
import { WhatsAppButton } from "./WhatsAppButton";
import { CategoryIcon } from "./CategoryIcon";
import { MobileFiltersSheet, SORT_LABELS, type SortKey } from "./MobileFiltersSheet";


interface CatalogExplorerProps {
  products: Product[];
  categories: Category[];
  categoryById: Map<string, Category>;
  settings: Settings | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const pill =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

export function CatalogExplorer({
  products,
  categories,
  categoryById,
  settings,
  isLoading,
  isError,
  onRetry,
}: CatalogExplorerProps) {
  const { q, cat, update } = useCatalogParams();
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("order");

  const activeCategory = categories.find((c) => c.slug === cat);
  const min = minPrice === "" ? null : Number(minPrice);
  const max = maxPrice === "" ? null : Number(maxPrice);

  // Everything except the category filter — used for per-category counts.
  const baseFiltered = useMemo(
    () =>
      products.filter((p) => {
        if (!matchesQuery(p, categoryById.get(p.category_id), q)) return false;
        if (onlyAvailable && !isAvailable(p)) return false;
        if (onlyPromo && !hasPromo(p)) return false;
        if (min != null && (p.price == null || p.price < min)) return false;
        if (max != null && (p.price == null || p.price > max)) return false;
        return true;
      }),
    [products, categoryById, q, onlyAvailable, onlyPromo, min, max],
  );

  const results = useMemo(() => {
    const list = activeCategory ? baseFiltered.filter((p) => p.category_id === activeCategory.id) : baseFiltered;
    const priced = (p: Product, fallback: number) => p.price ?? fallback;
    switch (sort) {
      case "price_asc":
        return [...list].sort((a, b) => priced(a, Infinity) - priced(b, Infinity));
      case "price_desc":
        return [...list].sort((a, b) => priced(b, -Infinity) - priced(a, -Infinity));
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
      default:
        return list;
    }
  }, [baseFiltered, activeCategory, sort]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of baseFiltered) m.set(p.category_id, (m.get(p.category_id) ?? 0) + 1);
    return m;
  }, [baseFiltered]);

  const priceActive = min != null || max != null;
  const extraFilters = Number(onlyAvailable) + Number(onlyPromo) + Number(priceActive);
  const anyActive = Boolean(q || activeCategory || extraFilters || sort !== "order");

  const resetAll = () => {
    setOnlyAvailable(false);
    setOnlyPromo(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("order");
    update({ q: null, cat: null });
  };

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (q) chips.push({ key: "q", label: `“${q}”`, clear: () => update({ q: null }) });
  if (activeCategory) chips.push({ key: "cat", label: activeCategory.name, clear: () => update({ cat: null }) });
  if (onlyAvailable) chips.push({ key: "available", label: "Solo disponibles", clear: () => setOnlyAvailable(false) });
  if (onlyPromo) chips.push({ key: "promo", label: "Con promoción", clear: () => setOnlyPromo(false) });
  if (priceActive)
    chips.push({
      key: "price",
      label: `Precio ${min != null ? `desde $${min.toLocaleString("es-AR")}` : ""} ${max != null ? `hasta $${max.toLocaleString("es-AR")}` : ""}`.trim(),
      clear: () => {
        setMinPrice("");
        setMaxPrice("");
      },
    });

  return (
    <section
      id="catalogo"
      aria-labelledby="catalogo-title"
      data-testid="catalog-section"
      className="mx-auto max-w-7xl scroll-mt-36 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="catalogo-title"
          eyebrow="Catálogo completo"
          title="Todos nuestros productos"
          description="Buscá, filtrá por categoría y encontrá la solución ideal para tu casa."
        />
      </div>

      {/* Category pills */}
      <div
        role="group"
        aria-label="Filtrar por categoría"
        className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto sm:mt-7 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <button
          type="button"
          aria-pressed={!activeCategory}
          onClick={() => update({ cat: null })}
          data-testid="category-filter-all"
          className={cn(
            pill,
            !activeCategory
              ? "border-brand bg-brand text-cream"
              : "border-beige bg-cream text-ink hover:border-brand/40 hover:text-brand",
          )}
        >
          Todos los productos
          <span className={cn("text-xs tabular-nums", !activeCategory ? "text-cream" : "text-ink")}>
            {baseFiltered.length}
          </span>
        </button>
        {categories.map((c) => {
          const active = activeCategory?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => update({ cat: active ? null : c.slug })}
              data-testid={`category-filter-${c.slug}`}
              className={cn(
                pill,
                active ? "border-brand bg-brand text-cream" : "border-beige bg-cream text-ink hover:border-brand/40 hover:text-brand",
              )}
            >
              <CategoryIcon icon={c.icon} className={cn("size-4", active ? "text-teal" : "text-teal")} />
              {c.name}
              <span className={cn("text-xs tabular-nums", active ? "text-cream" : "text-ink")}>
                {counts.get(c.id) ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-beige py-3">
        <p className="text-base text-ink" aria-live="polite" data-testid="catalog-results-count">
          {isLoading ? (
            "Cargando productos…"
          ) : (
            <>
              <strong className="font-bold text-brand">{results.length}</strong>{" "}
              {results.length === 1 ? "producto encontrado" : "productos encontrados"}
            </>
          )}
        </p>
        <MobileFiltersSheet
          categories={categories}
          counts={counts}
          totalCount={baseFiltered.length}
          activeCategoryId={activeCategory?.id ?? null}
          onCategory={(slug) => update({ cat: slug })}
          sort={sort}
          setSort={setSort}
          onlyAvailable={onlyAvailable}
          setOnlyAvailable={setOnlyAvailable}
          onlyPromo={onlyPromo}
          setOnlyPromo={setOnlyPromo}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          resultsCount={results.length}
          activeCount={extraFilters + Number(sort !== "order") + Number(Boolean(activeCategory))}
          onReset={resetAll}
        />
        <div className="hidden items-center gap-2 md:flex">
          <Popover>
            <PopoverTrigger
              data-testid="catalog-filters-trigger"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-beige bg-cream px-3.5 text-sm font-semibold text-brand transition-colors duration-200 hover:border-brand/40 hover:bg-beige"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filtros
              {extraFilters > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-cream">
                  {extraFilters}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-80 space-y-5 p-5" data-testid="catalog-filters-panel">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Disponibilidad y promos</p>
                <Label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
                  <Checkbox
                    checked={onlyAvailable}
                    onCheckedChange={(v) => setOnlyAvailable(Boolean(v))}
                    data-testid="filter-only-available-checkbox"
                  />
                  Solo productos disponibles
                </Label>
                <Label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
                  <Checkbox
                    checked={onlyPromo}
                    onCheckedChange={(v) => setOnlyPromo(Boolean(v))}
                    data-testid="filter-only-promo-checkbox"
                  />
                  Solo con promoción o descuento
                </Label>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Precio (ARS)</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Desde"
                    aria-label="Precio mínimo"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    data-testid="filter-price-min-input"
                    className="h-10"
                  />
                  <span className="text-ink">–</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="Hasta"
                    aria-label="Precio máximo"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    data-testid="filter-price-max-input"
                    className="h-10"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Select value={sort} onValueChange={(v: string) => setSort(v as SortKey)}>
            <SelectTrigger
              aria-label="Ordenar productos"
              data-testid="catalog-sort-select"
              className="h-10! min-w-40 rounded-xl border-beige bg-cream text-sm font-semibold text-brand"
            >
              <SelectValue>{(v: unknown) => SORT_LABELS[v as SortKey]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <SelectItem key={k} value={k} data-testid={`catalog-sort-option-${k}`}>
                  {SORT_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter chips */}
      {anyActive && (
        <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="active-filters">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Filtros activos:</span>
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={c.clear}
              data-testid={`active-filter-chip-${c.key}`}
              aria-label={`Quitar filtro ${c.label}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-beige pl-3 pr-2 text-xs font-semibold text-brand transition-colors duration-200 hover:bg-beige"
            >
              {c.label}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={resetAll}
            data-testid="reset-filters-button"
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-brand underline-offset-4 transition-colors hover:underline"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Grid / states */}
      <div className="mt-6">
        {isError && !isLoading ? (
          <div
            data-testid="catalog-error-state"
            className="flex flex-col items-start gap-4 rounded-2xl border border-beige bg-cream p-8 sm:p-10"
          >
            <p className="text-lg font-bold text-brand">No pudimos cargar los productos.</p>
            <p className="text-sm text-ink">Revisá tu conexión e intentá de nuevo. También podés consultarnos por WhatsApp.</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onRetry}
                data-testid="catalog-retry-button"
                className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-cream transition-colors hover:bg-ink"
              >
                Reintentar
              </button>
              <WhatsAppButton settings={settings} testId="catalog-error-whatsapp-button" />
            </div>
          </div>
        ) : isLoading || !settings ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div
            data-testid="catalog-empty-state"
            className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-beige bg-cream px-6 py-14 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-beige text-teal">
              <PackageSearch className="size-7" aria-hidden="true" />
            </span>
            <div className="space-y-1.5">
              <p className="text-lg font-bold text-brand">
                {q ? `No encontramos productos para “${q}”` : "No hay productos con estos filtros"}
              </p>
              <p className="mx-auto max-w-md text-sm text-ink">
                Probá con otra palabra o una más corta (por ejemplo “led” o “cam”), revisá los filtros o consultanos:
                quizás lo tenemos y todavía no está publicado.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetAll}
                data-testid="empty-state-reset-button"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-beige bg-cream px-5 text-sm font-semibold text-brand transition-colors hover:bg-beige"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Ver todos los productos
              </button>
              <WhatsAppButton settings={settings} testId="empty-state-whatsapp-button">
                Consultar por WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        ) : (
          <div
            data-testid="catalog-grid"
            className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4"
          >
            {results.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
                <ProductCard product={p} category={categoryById.get(p.category_id)} settings={settings} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
