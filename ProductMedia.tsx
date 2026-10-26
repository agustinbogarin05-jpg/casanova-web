import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";

interface ProductMediaProps {
  product: Product;
  category?: Category;
  imageIndex?: number;
  size?: "xs" | "sm" | "lg";
  eager?: boolean;
  className?: string;
}

/** Real photo when available (object-contain keeps cards uniform whatever the ratio),
 *  otherwise a flat beige placeholder ready to be replaced with a real photo. */
export function ProductMedia({ product, category, imageIndex = 0, size = "sm", eager = false, className }: ProductMediaProps) {
  const src = product.images[imageIndex];
  const [failed, setFailed] = useState<string | null>(null);

  if (src && failed !== src) {
    return (
      <div className={cn("relative h-full w-full bg-beige", className)}>
        <img
          src={src}
          alt={imageIndex === 0 ? product.name : `${product.name}, foto ${imageIndex + 1}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onError={() => setFailed(src)}
          className="absolute inset-0 h-full w-full object-contain p-[6%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      data-testid="product-media-placeholder"
      role="img"
      aria-label={`${product.name}: foto pendiente de carga`}
      className={cn("relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-beige", className)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-beige bg-cream text-teal transition-transform duration-500 ease-out group-hover:scale-105",
          size === "lg" ? "size-24 sm:size-28" : size === "xs" ? "size-9 rounded-xl" : "size-14 sm:size-16",
        )}
      >
        <CategoryIcon icon={category?.icon} className={size === "lg" ? "size-10 sm:size-12" : size === "xs" ? "size-4" : "size-6 sm:size-7"} />
      </div>
      {size !== "xs" && <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">Foto a cargar</span>}
    </div>
  );
}
