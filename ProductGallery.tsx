import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductMedia } from "./ProductMedia";
import { ProductBadges } from "./ProductCard";

const navBtn =
  "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-beige bg-cream text-brand transition-[background-color,transform] duration-200 hover:bg-beige active:scale-95";

/** Shows every photo uploaded for the product: main view (swipe / arrows / keyboard), all thumbnails, and a zoom view. */
export function ProductGallery({ product, category }: { product: Product; category?: Category }) {
  const total = product.images.length;
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = total ? Math.min(active, total - 1) : 0;
  const go = (step: number) => total > 1 && setActive((current + step + total) % total);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) go(1);
    else if (info.offset.x > 50) go(-1);
  };

  const viewer = (large: boolean) => (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={current}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        drag={total > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={onDragEnd}
        className="absolute inset-0 touch-pan-y"
      >
        <ProductMedia product={product} category={category} imageIndex={current} size="lg" eager={!large} />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      className="space-y-3"
      data-testid="product-gallery"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-beige bg-beige">
        {viewer(false)}
        <ProductBadges product={product} className="absolute left-4 top-4" />
        {total > 0 && (
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Ampliar foto"
            data-testid="gallery-zoom-button"
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-beige bg-cream text-brand transition-colors hover:bg-beige"
          >
            <Expand className="size-4" />
          </button>
        )}
        {total > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" data-testid="gallery-prev-button" className={cn(navBtn, "left-3")}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" data-testid="gallery-next-button" className={cn(navBtn, "right-3")}>
              <ChevronRight className="size-5" />
            </button>
            <span
              className="absolute bottom-3 right-3 rounded-full border border-beige bg-cream px-3 py-1 text-sm font-semibold tabular-nums text-brand"
              data-testid="gallery-counter"
            >
              Foto {current + 1} de {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5" role="tablist" aria-label="Fotos del producto" data-testid="gallery-thumbnails">
          {product.images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              onClick={() => setActive(i)}
              data-testid={`gallery-thumb-${i}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-beige transition-[border-color,opacity] duration-200",
                i === current ? "border-teal" : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <img src={src} alt="" loading="lazy" draggable={false} className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-5xl bg-cream p-3 sm:max-w-5xl sm:p-4" data-testid="gallery-zoom-dialog">
          <DialogTitle className="sr-only">
            {product.name} — foto {current + 1} de {total}
          </DialogTitle>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-beige">
            {viewer(true)}
            {total > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" data-testid="zoom-prev-button" className={cn(navBtn, "left-3")}>
                  <ChevronLeft className="size-5" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" data-testid="zoom-next-button" className={cn(navBtn, "right-3")}>
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
          {total > 1 && (
            <p className="px-1 pt-1 text-sm font-semibold text-brand">
              Foto {current + 1} de {total}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
