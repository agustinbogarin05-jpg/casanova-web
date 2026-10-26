import { Link, Outlet, useLocation } from "react-router-dom";
import { SiFacebook, SiInstagram, SiTiktok, SiYoutube } from "@icons-pack/react-simple-icons";
import { useCatalog } from "@/lib/catalog";
import { useCatalogParams } from "@/lib/useCatalogParams";
import type { Settings } from "@/lib/types";
import { SiteHeader } from "./SiteHeader";
import { Logo } from "./Logo";
import { WhatsAppButton } from "./WhatsAppButton";
import { FavoritesSheet, FavoritesTrigger } from "./Favorites";
import { useCartCount } from "@/lib/favorites";
import { cn } from "@/lib/utils";

const SOCIALS: { key: keyof Settings; label: string; Icon: typeof SiInstagram }[] = [
  { key: "instagram_url", label: "Instagram", Icon: SiInstagram },
  { key: "facebook_url", label: "Facebook", Icon: SiFacebook },
  { key: "tiktok_url", label: "TikTok", Icon: SiTiktok },
  { key: "youtube_url", label: "YouTube", Icon: SiYoutube },
];

function SocialLinks({ settings }: { settings: Settings | undefined }) {
  const links = SOCIALS.filter((s) => settings && String(settings[s.key] ?? "").startsWith("https://"));
  if (links.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-3" aria-label="Redes sociales">
      {links.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={String(settings?.[key])}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`footer-social-${label.toLowerCase()}`}
            className="group inline-flex h-11 items-center gap-2.5 rounded-xl border border-beige px-4 text-[15px] font-semibold text-brand transition-[background-color,border-color] duration-200 hover:border-teal hover:bg-beige"
          >
            <Icon size={18} color="#19A89A" aria-hidden="true" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function SiteFooter() {
  const { data } = useCatalog();
  const { update } = useCatalogParams();
  const settings = data?.settings;
  return (
    <footer data-testid="site-footer" className="mt-24 border-t border-beige bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="space-y-6 md:col-span-5">
          <Logo testId="footer-logo-link" />
          <p className="max-w-sm text-base leading-relaxed text-ink">
            Soluciones eléctricas y electrónicas para que tu casa sea más cómoda, segura y linda. Te asesoramos antes y
            después de tu compra.
          </p>
          <WhatsAppButton settings={settings} testId="footer-whatsapp-button" size="md">
            Escribinos por WhatsApp
          </WhatsAppButton>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-lg font-bold text-brand">Categorías</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1">
            {(data?.categories ?? []).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => update({ cat: c.slug }, { scroll: true })}
                  data-testid={`footer-category-${c.slug}`}
                  className="min-h-10 text-left text-base text-ink underline-offset-4 transition-colors duration-200 hover:text-brand hover:underline hover:decoration-teal hover:decoration-2"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4 md:col-span-4">
          <h2 className="text-lg font-bold text-brand">Seguinos</h2>
          <SocialLinks settings={settings} />
          <p className="text-base leading-relaxed text-ink">
            Las compras se coordinan por WhatsApp: confirmamos stock, medio de pago y entrega con vos.
          </p>
        </div>
      </div>
      <div className="border-t border-beige">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-ink sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} CASANOVA · Tecnología para el hogar</p>
        </div>
      </div>
    </footer>
  );
}

/** Persistent shell for public pages: the header (and its live search) stays mounted across routes. */
/** Phones: floating "Favoritos" pill once something is saved (sits above the product page's sticky bar). */
function FloatingFavorites() {
  const count = useCartCount();
  const onProduct = useLocation().pathname.startsWith("/producto/");
  if (!count) return null;
  return (
    <div className={cn("fixed right-4 z-30 animate-fade-up sm:hidden", onProduct ? "bottom-24" : "bottom-4")}>
      <FavoritesTrigger label />
    </div>
  );
}

export function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-cream"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingFavorites />
      <FavoritesSheet />
    </div>
  );
}
