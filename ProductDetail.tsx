import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Banknote, Check, ChevronRight, CreditCard, Link2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cashPrice, categoryMap, getRelated, shareProductUrl, installmentInfo, formatInstallment, formatPrice, useCatalog } from "@/lib/catalog";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { AvailabilityTag, PriceBlock } from "@/components/catalog/PriceBlock";
import { WhatsAppButton } from "@/components/catalog/WhatsAppButton";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SectionHeading } from "@/components/catalog/HomeSections";
import { FavoriteButton } from "@/components/catalog/Favorites";

const PENDING = <span className="text-ink">A confirmar</span>;

export default function ProductDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();

  const product = data?.products.find((p) => p.id === id);
  const byId = useMemo(() => categoryMap(data?.categories ?? []), [data]);
  const category = product ? byId.get(product.category_id) : undefined;
  const related = useMemo(() => (product && data ? getRelated(product, data.products) : []), [product, data]);
  const settings = data?.settings;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);
  useEffect(() => {
    if (product) document.title = `${product.name} | CASANOVA`;
  }, [product]);

  const back = () => (location.key !== "default" ? navigate(-1) : navigate("/"));

  const backButton = (
    <button
      type="button"
      onClick={back}
      data-testid="product-back-button"
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-beige bg-cream px-3.5 text-sm font-semibold text-brand transition-colors duration-200 hover:bg-beige"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Volver al catálogo
    </button>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" data-testid="product-detail-loading">
        {backButton}
        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-beige lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5">
            <div className="h-8 w-3/4 animate-pulse rounded bg-beige" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-beige" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-beige" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !settings) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {backButton}
        <div data-testid="product-not-found" className="mt-8 rounded-2xl border border-beige bg-cream p-8 sm:p-12">
          <p className="text-[30px] font-bold leading-tight text-brand">
            {isError ? "No pudimos cargar este producto." : "No encontramos este producto."}
          </p>
          <p className="mt-2 text-sm text-ink">
            {isError
              ? "Revisá tu conexión e intentá nuevamente."
              : "Puede que ya no esté publicado. Mirá el catálogo completo o consultanos por WhatsApp."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {isError ? (
              <button
                type="button"
                onClick={() => void refetch()}
                data-testid="product-retry-button"
                className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-cream hover:bg-ink"
              >
                Reintentar
              </button>
            ) : (
              <Link
                to="/"
                data-testid="product-not-found-home-link"
                className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-cream hover:bg-ink"
              >
                Ver catálogo
              </Link>
            )}
            <WhatsAppButton settings={settings} testId="product-not-found-whatsapp-button" />
          </div>
        </div>
      </div>
    );
  }

  const productUrl = `${window.location.origin}/producto/${product.id}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Enlace copiado. ¡Ya podés pegarlo donde quieras!");
    } catch {
      toast.message("Copiá este enlace:", { description: productUrl });
    }
  };
  const inst = installmentInfo(product, settings);
  const cash = cashPrice(product, settings);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-0" data-testid="product-detail-page">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {backButton}
        <nav aria-label="Ruta de navegación" className="flex min-w-0 items-center gap-1.5 text-sm text-ink">
          <Link to="/" className="hover:text-brand" data-testid="breadcrumb-home">
            Catálogo
          </Link>
          {category && (
            <>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link to={`/?cat=${category.slug}`} state={{ scrollTo: "catalogo" }} className="hover:text-brand" data-testid="breadcrumb-category">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="hidden size-3.5 sm:block" aria-hidden="true" />
          <span className="hidden truncate font-medium text-ink sm:block">{product.name}</span>
        </nav>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-14">
        <div className="order-1 min-w-0 lg:order-none lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <ProductGallery product={product} category={category} />
        </div>

        {/* Left (desktop) / after purchase panel (mobile): information */}
        <div className="order-3 min-w-0 space-y-12 lg:order-none lg:col-span-7 lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="desc-title" className="space-y-3" data-testid="product-description">
            <h2 id="desc-title" className="text-[30px] font-bold leading-tight text-brand">
              Descripción
            </h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {product.description || <span className="text-ink">Descripción a completar.</span>}
            </p>
          </section>

          <section aria-labelledby="specs-title" className="space-y-4" data-testid="product-specs">
            <h2 id="specs-title" className="text-[30px] font-bold leading-tight text-brand">
              Características técnicas
            </h2>
            {product.specs.length === 0 ? (
              <p className="text-sm text-ink">Las características técnicas se publicarán una vez verificadas.</p>
            ) : (
              <dl className="divide-y divide-beige overflow-hidden rounded-2xl border border-beige bg-cream">
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3.5">
                    <dt className="text-base font-bold text-brand">{s.label}</dt>
                    <dd className="text-base text-ink">{s.value || PENDING}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section aria-labelledby="includes-title" className="space-y-4" data-testid="product-includes">
            <h2 id="includes-title" className="text-[30px] font-bold leading-tight text-brand">
              Qué incluye
            </h2>
            {product.includes.length === 0 ? (
              <p className="text-sm">{PENDING}</p>
            ) : (
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {product.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-base text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {product.warranty && (
            <section
              aria-labelledby="warranty-title"
              data-testid="product-warranty"
              className="flex gap-4 rounded-2xl border border-beige bg-cream p-5"
            >
              <ShieldCheck className="size-6 shrink-0 text-teal" aria-hidden="true" />
              <div>
                <h2 id="warranty-title" className="font-bold text-brand">
                  Garantía
                </h2>
                <p className="mt-1 text-sm text-ink">{product.warranty}</p>
              </div>
            </section>
          )}
        </div>

        {/* Right: purchase panel */}
        <aside className="order-2 min-w-0 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{category.name}</span>
                )}
                {product.is_demo && (
                  <span className="rounded-md bg-beige px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand">
                    Producto demostrativo
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <h1 data-testid="product-title" className="text-3xl font-extrabold leading-tight tracking-tight text-brand sm:text-4xl">
                  {product.name}
                </h1>
                <FavoriteButton product={product} size="lg" className="mt-1 shrink-0" />
              </div>
              {product.short_description && (
                <p className="text-base leading-relaxed text-ink">{product.short_description}</p>
              )}
              <AvailabilityTag product={product} className="text-sm" />
            </div>

            <div className="rounded-2xl border border-beige bg-cream p-5 sm:p-6">
              <PriceBlock product={product} settings={settings} size="lg" showCash />
              <WhatsAppButton
                settings={settings}
                productName={product.name}
                size="lg"
                className="mt-5 h-14 w-full text-base"
                testId="product-whatsapp-button"
              >
                <span className="sm:hidden">Consultar por WhatsApp</span>
                <span className="hidden sm:inline">Consultar o comprar por WhatsApp</span>
              </WhatsAppButton>
              <p className="mt-3 text-xs leading-relaxed text-ink">
                Te respondemos por WhatsApp para confirmar disponibilidad, medio de pago y entrega. No se realizan cobros
                desde este catálogo.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-beige p-5" data-testid="product-share">
              <p className="text-base font-bold text-brand">¿Se lo querés mostrar a alguien?</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <WhatsAppButton
                  settings={settings}
                  href={shareProductUrl(product.name, productUrl)}
                  size="md"
                  className="h-12 w-full"
                  testId="product-share-whatsapp-button"
                >
                  Enviar a un amigo
                </WhatsAppButton>
                <button
                  type="button"
                  onClick={copyLink}
                  data-testid="product-copy-link-button"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-beige text-[15px] font-semibold text-brand transition-[background-color,border-color] duration-200 hover:border-teal hover:bg-beige active:scale-[0.98]"
                >
                  <Link2 className="size-4 text-teal" aria-hidden="true" />
                  Copiar enlace
                </button>
              </div>
            </div>

            {(inst || cash != null) && (
              <div className="space-y-4 rounded-2xl bg-beige p-5" data-testid="product-payment-conditions">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Medios de pago</p>
                {inst && (
                  <div className="flex gap-3">
                    <CreditCard className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <div className="text-sm">
                      <p className="font-bold text-brand">
                        {inst.count} cuotas sin interés de {formatInstallment(inst.amount)}
                      </p>
                      <p className="text-[13px] text-ink">
                        Total {formatPrice(product.price ?? 0)}. {settings.installments_conditions}
                      </p>
                    </div>
                  </div>
                )}
                {cash != null && (
                  <div className="flex gap-3">
                    <Banknote className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <div className="text-sm">
                      <p className="font-bold text-brand">
                        {formatPrice(cash)} en efectivo ({settings.cash_discount_percent}% off)
                      </p>
                      <p className="text-[13px] text-ink">{settings.cash_discount_conditions}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20 border-t border-beige pt-12" data-testid="related-products-section">
          <SectionHeading
            id="related-title"
            eyebrow="Para complementar"
            title="Productos relacionados"
            description={category ? `Más soluciones de ${category.name.toLowerCase()} y productos compatibles.` : undefined}
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} category={byId.get(p.category_id)} settings={settings} testIdPrefix="related-card" />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-beige bg-cream/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink">{product.name}</p>
            <p className="text-lg font-bold text-brand tabular-nums">
              {product.price != null ? formatPrice(product.price) : "Consultar precio"}
            </p>
          </div>
          <WhatsAppButton settings={settings} productName={product.name} size="md" className="h-12" testId="product-sticky-whatsapp-button">
            Consultar
          </WhatsAppButton>
        </div>
      </div>
    </div>
  );
}
