import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalogParams } from "@/lib/useCatalogParams";

export function SearchField({ className }: { className?: string }) {
  const { q, update } = useCatalogParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search from anywhere (desktop shortcut)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) && !target.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur();
        update({ q: q.trim() || null }, { scroll: true });
      }}
    >
      <label htmlFor="catalog-search" className="sr-only">
        Buscar productos
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id="catalog-search"
        type="search"
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
        value={q}
        onChange={(e) => update({ q: e.target.value || null })}
        placeholder="Buscá cámaras, LED, enchufes…"
        data-testid="header-search-input"
        className="h-11 w-full rounded-xl border border-beige bg-cream pl-10 pr-20 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink focus:border-teal focus:ring-4 focus:ring-beige [&::-webkit-search-cancel-button]:hidden"
      />
      {q ? (
        <button
          type="button"
          onClick={() => {
            update({ q: null });
            inputRef.current?.focus();
          }}
          aria-label="Limpiar búsqueda"
          data-testid="header-search-clear-button"
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:bg-beige hover:text-brand"
        >
          <X className="size-4" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-beige bg-cream px-1.5 py-0.5 text-xs font-semibold text-ink md:block">
          /
        </kbd>
      )}
    </form>
  );
}
