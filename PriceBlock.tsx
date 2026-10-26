import { cn } from "@/lib/utils";
import { AVAILABILITY, cashPrice, discountPercent, formatInstallment, formatPrice, installmentInfo } from "@/lib/catalog";
import type { Product, Settings } from "@/lib/types";

interface PriceBlockProps {
  product: Product;
  settings: Settings;
  size?: "sm" | "lg";
  showCash?: boolean;
  className?: string;
}

export function PriceBlock({ product, settings, size = "sm", showCash = false, className }: PriceBlockProps) {
  const discount = discountPercent(product);
  const inst = installmentInfo(product, settings);
  const cash = showCash ? cashPrice(product, settings) : null;

  return (
    <div className={cn("space-y-1", className)} data-testid={`price-block-${product.id}`}>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        {product.price == null ? (
          <span className="text-lg font-bold text-brand">Consultar precio</span>
        ) : (
          <span
            data-testid="product-price"
            className={cn("font-bold tracking-tight text-brand tabular-nums", size === "sm" ? "text-lg sm:text-[22px]" : "text-4xl")}
          >
            {formatPrice(product.price)}
          </span>
        )}
        {product.previous_price != null && discount != null && (
          <>
            <span data-testid="product-previous-price" className="text-xs text-ink sm:text-sm tabular-nums line-through decoration-teal">
              {formatPrice(product.previous_price)}
            </span>
            <span className="rounded-md border border-teal px-1.5 py-0.5 text-xs font-bold text-brand">-{discount}%</span>
          </>
        )}
      </div>
      {inst && (
        <p data-testid="product-installments" className={cn("font-semibold text-ink", size === "sm" ? "text-xs sm:text-sm" : "text-base")}>
          {inst.count} cuotas sin interés de {formatInstallment(inst.amount)}
        </p>
      )}
      {cash != null && (
        <p data-testid="product-cash-price" className="text-base text-ink">
          <span className="font-bold text-brand tabular-nums">{formatPrice(cash)}</span> pagando en efectivo (
          {settings.cash_discount_percent}% off)
        </p>
      )}
    </div>
  );
}

export function AvailabilityTag({ product, className }: { product: Product; className?: string }) {
  const meta = AVAILABILITY[product.availability];
  return (
    <span data-testid={`availability-${product.id}`} className={cn("inline-flex items-center gap-2 text-sm font-semibold text-ink", className)}>
      <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
