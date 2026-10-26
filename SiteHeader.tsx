import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutGrid, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/lib/catalog";
import { useCatalogParams } from "@/lib/useCatalogParams";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { SearchField } from "./SearchField";
import { WhatsAppButton } from "./WhatsAppButton";
import { CategoryIcon } from "./CategoryIcon";
import { FavoritesTrigger } from "./Favorites";
import { favorites } from "@/lib/favorites";

const navLink =
  "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-beige hover:text-brand focus-visible:outline-2 focus-visible:outline-teal";

export function SiteHeader() {
  const { data } = useCatalog();
  const { update, goToSection } = useCatalogParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRowRef = useRef<HTMLDivElement>(null);
  const [collapse, setCollapse] = useState(0); // px to slide up: hides the logo row, keeps the search visible

  // Phones/tablets (< md): scrolling down hides the logo row and keeps only the search fixed; scrolling up shows it again.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const searchFocused = document.activeElement?.id === "catalog-search";
      const offset = (searchRowRef.current?.offsetTop ?? 0) - 10;
      if (!mq.matches || y < 90 || menuOpen) setCollapse(0);
      else if (y > lastY + 4 && !searchFocused) setCollapse(offset);
      else if (y < lastY - 4) setCollapse(0);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", update);
    };
  }, [menuOpen]);
  const categories = data?.categories ?? [];
  const settings = data?.settings;

  const pickCategory = (slug: string | null) => {
    setMenuOpen(false);
    update({ cat: slug }, { scroll: true });
  };
  const goTo = (id: string) => {
    setMenuOpen(false);
    goToSection(id);
  };

  return (
    <header
      data-testid="site-header"
      data-collapsed={collapse > 0}
      style={{ transform: collapse ? `translateY(-${collapse}px)` : undefined }}
      className="sticky top-0 z-40 border-b border-beige bg-cream/90 backdrop-blur-md transition-transform duration-300 ease-out supports-[backdrop-filter]:bg-cream/80"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-3.5 sm:gap-x-4 px-4 pb-3.5 pt-4 sm:px-6 sm:py-3 lg:gap-x-6 lg:px-8 lg:py-4">
        <div
          className={cn(
            "min-w-0 flex-1 basis-0 transition-opacity duration-200 md:flex-none md:basis-auto",
            collapse > 0 && "pointer-events-none opacity-0",
          )}
        >
          <Logo fluid />
        </div>

        <nav aria-label="Navegación principal" className="hidden items-center gap-0.5 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className={navLink} data-testid="header-categories-trigger">
              Categorías
              <ChevronDown className="size-4 text-ink" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="min-w-60 p-1.5">
              <DropdownMenuItem
                data-testid="header-category-item-all"
                onClick={() => pickCategory(null)}
                className="gap-2.5 py-2"
              >
                <LayoutGrid className="size-4 text-teal" />
                Todos los productos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  data-testid={`header-category-item-${c.slug}`}
                  onClick={() => pickCategory(c.slug)}
                  className="gap-2.5 py-2"
                >
                  <CategoryIcon icon={c.icon} className="size-4 text-teal" />
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <a
            href="/#mas-elegidos"
            data-testid="header-nav-best-sellers"
            className={navLink}
            onClick={(e) => {
              e.preventDefault();
              goTo("mas-elegidos");
            }}
          >
            Más elegidos
          </a>
          <a
            href="/#como-comprar"
            data-testid="header-nav-how-to-buy"
            className={navLink}
            onClick={(e) => {
              e.preventDefault();
              goTo("como-comprar");
            }}
          >
            Cómo comprar
          </a>
        </nav>

        <div ref={searchRowRef} className="order-last w-full md:order-none md:ml-auto md:w-auto md:max-w-md md:flex-1 xl:max-w-lg">
          <SearchField />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <FavoritesTrigger className="hidden sm:inline-flex" />
          <WhatsAppButton
            settings={settings}
            testId="header-whatsapp-button"
            className="hidden sm:inline-flex"
            size="md"
          >
            Consultanos
          </WhatsAppButton>
          <WhatsAppButton settings={settings} testId="header-whatsapp-icon-button" variant="icon" className="sm:hidden" />

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label="Abrir menú"
              data-testid="header-mobile-menu-trigger"
              className="inline-flex size-11 items-center justify-center rounded-xl border border-beige bg-cream text-brand transition-colors duration-200 hover:bg-beige lg:hidden"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm bg-cream p-0" data-testid="mobile-menu">
              <SheetHeader className="border-b border-beige px-5 py-4">
                <SheetTitle className="text-left text-base font-bold text-brand">Menú</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 overflow-y-auto px-3 py-5">
                <div>
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                    Categorías
                  </p>
                  <button
                    type="button"
                    onClick={() => pickCategory(null)}
                    data-testid="mobile-category-item-all"
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-beige"
                  >
                    <LayoutGrid className="size-5 text-teal" /> Todos los productos
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => pickCategory(c.slug)}
                      data-testid={`mobile-category-item-${c.slug}`}
                      className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-beige"
                    >
                      <CategoryIcon icon={c.icon} className="size-5 text-teal" /> {c.name}
                    </button>
                  ))}
                </div>
                <div className="border-t border-beige pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      favorites.setPanel(true);
                    }}
                    data-testid="mobile-nav-favorites"
                    className="flex min-h-12 w-full items-center rounded-xl px-3 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-beige"
                  >
                    Mi pedido
                  </button>
                  {[
                    ["mas-elegidos", "Más elegidos"],
                    ["como-comprar", "Cómo comprar"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goTo(id)}
                      data-testid={`mobile-nav-${id}`}
                      className="flex min-h-12 w-full items-center rounded-xl px-3 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-beige"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="px-3">
                  <WhatsAppButton settings={settings} testId="mobile-menu-whatsapp-button" size="lg" className="w-full">
                    Consultanos por WhatsApp
                  </WhatsAppButton>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
