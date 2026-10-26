import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { categoryMap, useCatalog } from "@/lib/catalog";
import { scrollToId, useCatalogParams, type ScrollState } from "@/lib/useCatalogParams";
import { BestSellersCarousel } from "@/components/catalog/BestSellersCarousel";
import { DemoNotice, HowToBuy, PromoStrip } from "@/components/catalog/HomeSections";
import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";

export default function Home() {
  const { data, isLoading, isError, refetch } = useCatalog();
  const location = useLocation();
  const { q } = useCatalogParams();
  const prevQ = useRef(q);

  const products = useMemo(() => (isError ? [] : (data?.products ?? [])), [data, isError]);
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const byId = useMemo(() => categoryMap(categories), [categories]);
  const settings = data?.settings;

  useEffect(() => {
    document.title = "CASANOVA · Tecnología para el hogar | Catálogo";
  }, []);

  // Header links / category picks from other pages ask to scroll to a section.
  useEffect(() => {
    const target = (location.state as ScrollState | null)?.scrollTo;
    if (target) window.setTimeout(() => scrollToId(target), 60);
  }, [location.key, location.state]);

  // When the user starts typing in the header search, bring the results into view.
  useEffect(() => {
    if (!prevQ.current && q) {
      const el = document.getElementById("catalogo");
      const r = el?.getBoundingClientRect();
      if (r && (r.top > 200 || r.bottom < 200)) scrollToId("catalogo");
    }
    prevQ.current = q;
  }, [q]);

  return (
    <div className="space-y-12 sm:space-y-20" data-testid="home-page">
      <h1 className="sr-only">CASANOVA · Catálogo de tecnología para el hogar</h1>

      <BestSellersCarousel products={products} categories={byId} settings={settings} isLoading={isLoading} />

      {settings && <PromoStrip settings={settings} />}

      <div className="space-y-6 sm:space-y-8">
        {settings?.show_demo_notice && <DemoNotice />}
        <CatalogExplorer
          products={products}
          categories={categories}
          categoryById={byId}
          settings={settings}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />
      </div>

      <HowToBuy settings={settings} />
    </div>
  );
}
