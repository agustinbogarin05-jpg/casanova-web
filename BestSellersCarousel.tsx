import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBestSellers } from "@/lib/catalog";
import type { Category, Product, Settings } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

interface BestSellersCarouselProps {
  products: Product[];
  categories: Map<string, Category>;
  settings: Settings | undefined;
  isLoading: boolean;
}

const ctrlBtn =
  "inline-flex size-11 items-center justify-center rounded-full border border-beige bg-cream text-brand transition-[background-color,border-color,transform] duration-200 hover:border-teal hover:bg-beige active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

// 1 card + peek on phones, 2 + peek on tablets, 3 on small laptops, 4 on desktop (so 5+ products always scroll).
const slideWidth =
  "w-[62%] min-[480px]:w-[45%] sm:w-[calc((100%-1.5rem)/2.2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]";

/** "Los más elegidos" — the first section under the header. Products are picked & ordered in Admin → Más elegidos. */
export function BestSellersCarousel({ products, categories, settings, isLoading }: BestSellersCarouselProps) {
  const list = settings ? getBestSellers(products, settings) : [];
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const step = () => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.offsetWidth + gap;
  };

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const s = step();
    setActive(s ? Math.round(track.scrollLeft / s) : 0);
    setEdges({ start: track.scrollLeft <= 4, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync, list.length]);

  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
  const go = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      const atStart = track.scrollLeft <= 4;
      if (dir === 1 && atEnd) track.scrollTo({ left: 0, behavior });
      else if (dir === -1 && atStart) track.scrollTo({ left: track.scrollWidth, behavior });
      else track.scrollBy({ left: dir * step(), behavior });
    },
    [behavior],
  );
  const goTo = (i: number) => trackRef.current?.scrollTo({ left: i * step(), behavior });

  const scrollable = !(edges.start && edges.end);
  const autoplay = Boolean(settings?.carousel_autoplay) && !reduceMotion && scrollable && !hovered && !focused && !userPaused;
  useEffect(() => {
    if (!autoplay || !settings) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") go(1);
    }, settings.carousel_interval_seconds * 1000);
    return () => window.clearInterval(t);
  }, [autoplay, go, settings, active]);

  if (!isLoading && list.length === 0) return null;

  return (
    <section
      id="mas-elegidos"
      aria-roledescription="carrusel"
      aria-labelledby="mas-elegidos-title"
      data-testid="best-sellers-section"
      className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-12 lg:px-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      onTouchStart={() => setUserPaused(true)}
    >
      <div className="flex items-end justify-between gap-5">
        <div className="space-y-3">
          <h2
            id="mas-elegidos-title"
            className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-brand sm:text-5xl lg:text-[56px]"
          >
            Los más elegidos
          </h2>
          <span className="block h-1 w-16 rounded-full bg-teal" aria-hidden="true" />
          <p className="max-w-xl text-[15px] text-ink sm:text-lg">
            {settings?.best_sellers_sort_by_sales && list.some((p) => p.units_sold != null)
              ? "Ordenados según unidades vendidas."
              : "Una selección de productos recomendados para equipar y mejorar tu casa."}
          </p>
        </div>
        {scrollable && (
          <div className="hidden items-center gap-2 sm:flex">
            {settings?.carousel_autoplay && !reduceMotion && (
              <button
                type="button"
                onClick={() => setUserPaused((v) => !v)}
                aria-label={userPaused ? "Reanudar desplazamiento automático" : "Pausar desplazamiento automático"}
                data-testid="best-sellers-pause-button"
                className={ctrlBtn}
              >
                {userPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            )}
            <button type="button" onClick={() => go(-1)} aria-label="Productos anteriores" data-testid="best-sellers-prev-button" className={ctrlBtn}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Siguientes productos" data-testid="best-sellers-next-button" className={ctrlBtn}>
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={sync}
        data-testid="best-sellers-track"
        className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:gap-6 sm:px-0"
      >
        {isLoading || !settings
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={cn("shrink-0 snap-start", slideWidth)}>
                <ProductCardSkeleton />
              </div>
            ))
          : list.map((p, i) => (
              <div
                key={p.id}
                className={cn("shrink-0 snap-start", slideWidth)}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${list.length}`}
              >
                <ProductCard product={p} category={categories.get(p.category_id)} settings={settings} testIdPrefix="best-seller-card" />
              </div>
            ))}
      </div>

      {scrollable && list.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1 sm:mt-5 sm:justify-start" role="tablist" aria-label="Posición del carrusel">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Ir a ${p.name}`}
              onClick={() => goTo(i)}
              data-testid={`best-sellers-dot-${i}`}
              className="group flex h-8 items-center px-0.5"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out",
                  i === active ? "w-8 bg-teal" : "w-3 bg-beige group-hover:bg-brand",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
