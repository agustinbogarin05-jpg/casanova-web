import { Banknote, CreditCard, Info, MessageCircle, Search, ShoppingBag } from "lucide-react";
import type { Settings } from "@/lib/types";
import { WhatsAppButton } from "./WhatsAppButton";

export function DemoNotice() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-testid="demo-notice">
      <p className="flex items-start gap-3 rounded-2xl border border-beige px-4 py-3 text-sm leading-relaxed text-ink sm:px-5 sm:py-4 sm:text-[15px]">
        <Info className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
        <span>
          <strong className="font-bold text-brand">Catálogo demostrativo:</strong> los productos, precios y
          disponibilidad son de ejemplo y se reemplazarán por los reales de CASANOVA.
        </span>
      </p>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      {eyebrow && (
        <p className="inline-block border-b-2 border-teal pb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
      )}
      <h2 id={id} className="text-[30px] font-bold leading-tight tracking-tight text-brand sm:text-4xl">
        {title}
      </h2>
      {description && <p className="text-base leading-relaxed text-ink sm:text-lg">{description}</p>}
    </div>
  );
}

export function PromoStrip({ settings }: { settings: Settings }) {
  const items = [
    settings.installments_enabled && {
      key: "cuotas",
      icon: CreditCard,
      title: `${settings.installments_count} cuotas sin interés`,
      text: settings.installments_conditions,
    },
    settings.cash_discount_enabled &&
      settings.cash_discount_percent > 0 && {
        key: "efectivo",
        icon: Banknote,
        title: `${settings.cash_discount_percent}% off en efectivo`,
        text: settings.cash_discount_conditions,
      },
    settings.whatsapp_promo_enabled && {
      key: "whatsapp",
      icon: MessageCircle,
      title: "Comprá por WhatsApp",
      text: "Consultá y coordiná tu compra, el pago y la entrega directamente con nosotros.",
    },
  ].filter((x): x is { key: string; icon: typeof CreditCard; title: string; text: string } => Boolean(x));

  if (items.length === 0) return null;
  return (
    <section aria-label="Promociones y medios de pago" data-testid="promo-strip" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
        {items.map(({ key, icon: Icon, title, text }) => (
          <div key={key} data-testid={`promo-item-${key}`} className="flex w-[78%] shrink-0 snap-start gap-3.5 rounded-2xl bg-beige p-4 sm:w-[45%] sm:p-6 md:w-auto">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cream text-teal">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-base font-bold text-brand sm:text-lg">{title}</p>
              <p className="text-sm leading-relaxed text-ink sm:text-[15px]">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowToBuy({ settings }: { settings: Settings | undefined }) {
  const steps = [
    { icon: Search, title: "Elegí tu producto", text: "Buscá o filtrá por categoría y mirá toda la información en la ficha." },
    { icon: MessageCircle, title: "Consultanos por WhatsApp", text: "Con un toque se abre el chat con el nombre del producto ya escrito." },
    {
      icon: ShoppingBag,
      title: "Coordinamos tu compra",
      text: "Te confirmamos disponibilidad, medio de pago y entrega. No se cobra nada desde el catálogo.",
    },
  ];
  return (
    <section id="como-comprar" aria-labelledby="como-comprar-title" data-testid="how-to-buy-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-3xl border border-beige p-5 sm:gap-10 sm:p-10 lg:grid-cols-12 lg:p-14">
        <div className="space-y-6 lg:col-span-4">
          <SectionHeading id="como-comprar-title" eyebrow="Simple y seguro" title="Cómo comprar" description="Te acompañamos en cada paso, sin formularios ni registros." />
          <WhatsAppButton settings={settings} testId="how-to-buy-whatsapp-button" size="lg">
            Empezar consulta
          </WhatsAppButton>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-8">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="space-y-3 border-t-2 border-teal pt-5">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold tabular-nums text-brand">0{i + 1}</span>
                <Icon className="size-5 text-teal" aria-hidden="true" />
              </div>
              <p className="text-lg font-bold text-brand">{title}</p>
              <p className="text-base leading-relaxed text-ink">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
