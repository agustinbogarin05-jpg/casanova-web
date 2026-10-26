import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { discountPercent } from "@/lib/catalog";
import type { Category, Product, Settings } from "@/lib/types";
import { ProductMedia } from "./ProductMedia";
import { AvailabilityTag, PriceBlock } from "./PriceBlock";
import { WhatsAppButton } from "./WhatsAppButton";
import { FavoriteButton } from "./Favorites";

interface ProductCardProps {
  product: Product;
  category?: Category;
  settings: Settings;
  className?: string;
  testIdPrefix?: string;
}

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const discount = discountPercent(product);
  if (!product.promo_label && discount == null) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {product.promo_label && (
        <span
          data-testid={`promo-label-${product.id}`}
          className="rounded-full border border-brand bg-cream px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-brand sm:px-2.5 sm:py-1"
        >
          {product.promo_label}
        </span>
      )}
      {discount != null && (
        <span className="rounded-full border border-teal bg-cream px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-brand sm:px-2.5 sm:py-1">
          {discount}% off
        </span>
      )}
    </div>
  );
}

/** Compact on phones (2 per row, whole card tappable, one WhatsApp button); roomier from sm up. */
export function ProductCard({ product, category, settings, className, testIdPrefix = "product-card" }: ProductCardProps) {
  const href = `/producto/${product.id}`;
  return (
    <article
      data-testid={`${testIdPrefix}-${product.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-beige bg-cream transition-[transform,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-teal",
        className,
      )}
    >
      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square overflow-hidden sm:aspect-[4/3]"
        data-testid={`${testIdPrefix}-image-link-${product.id}`}
      >
        <ProductMedia product={product} category={category} />
        <ProductBadges product={product} className="absolute left-2 top-2 sm:left-3 sm:top-3" />
        {product.is_demo && (
          <span className="absolute bottom-2 left-2 rounded-md bg-cream px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink sm:bottom-3 sm:left-3 sm:text-xs">
            Demo
          </span>
        )}
      </Link>
      <FavoriteButton product={product} className="absolute right-2 top-2 z-20 sm:right-3 sm:top-3" />

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-5">
        {category && (
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-ink sm:text-xs">{category.name}</span>
        )}
        <h3 className="line-clamp-2 min-h-[2.7em] text-[15px] font-bold leading-snug text-brand sm:text-lg">
          {/* the title link covers the whole card on phones so any tap opens the product */}
          <Link
            to={href}
            data-testid={`${testIdPrefix}-title-link-${product.id}`}
            className="rounded-sm underline-offset-4 after:absolute after:inset-0 sm:hover:underline sm:hover:decoration-teal sm:hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal sm:after:hidden"
          >
            {product.name}
          </Link>
        </h3>
        <AvailabilityTag product={product} className="text-xs sm:text-sm" />
        <PriceBlock product={product} settings={settings} className="mt-auto pt-1 sm:pt-2" />
        <div className="relative z-10 flex items-center gap-2 pt-2 sm:pt-3">
          <Link
            to={href}
            data-testid={`${testIdPrefix}-view-button-${product.id}`}
            className="hidden h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-beige bg-cream px-3 text-sm font-semibold text-brand transition-[background-color,border-color] duration-200 hover:border-brand hover:bg-beige focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal sm:inline-flex"
          >
            Ver producto
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <WhatsAppButton
            settings={settings}
            productName={product.name}
            variant="icon"
            className="hidden sm:inline-flex"
            testId={`${testIdPrefix}-whatsapp-${product.id}`}
          />
          <WhatsAppButton
            settings={settings}
            productName={product.name}
            size="sm"
            className="w-full sm:hidden"
            testId={`${testIdPrefix}-whatsapp-mobile-${product.id}`}
          >
            Consultar
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-beige" data-testid="product-card-skeleton">
      <div className="aspect-square animate-pulse bg-beige sm:aspect-[4/3]" />
      <div className="space-y-3 p-3 sm:p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-beige" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-beige" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-beige" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-beige" />
      </div>
    </div>
  );
}
