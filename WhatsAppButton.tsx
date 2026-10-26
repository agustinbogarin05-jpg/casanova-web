import type { MouseEvent, ReactNode } from "react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/catalog";
import type { Settings } from "@/lib/types";

type Variant = "solid" | "icon";

interface WhatsAppButtonProps {
  settings: Settings | undefined;
  productName?: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  className?: string;
  testId: string;
  /** Custom wa.me link (e.g. sharing a product with a friend) instead of the business chat. */
  href?: string;
}

// Every WhatsApp click keeps the same teal treatment (as requested), everywhere in the app.
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-teal font-semibold whitespace-nowrap text-white transition-[background-color,transform] duration-200 hover:bg-teal-dark active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const sizes = { sm: "h-10 px-3.5 text-sm", md: "h-11 px-5 text-[15px]", lg: "h-13 px-6 text-base" };

/** Opens WhatsApp with the pre-filled message. The number is configured once, in Admin → Configuración. */
export function WhatsAppButton({ settings, productName, variant = "solid", size = "md", children, className, testId, href }: WhatsAppButtonProps) {
  const label = productName ? `Consultar por WhatsApp sobre ${productName}` : "Contactar por WhatsApp";
  return (
    <a
      href={href ?? whatsappUrl(settings, productName)}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      aria-label={variant === "icon" ? label : undefined}
      title={variant === "icon" ? label : undefined}
      onClick={(e: MouseEvent) => e.stopPropagation()}
      className={cn(base, variant === "icon" ? "size-11 shrink-0 p-0" : sizes[size], className)}
    >
      <SiWhatsapp size={variant === "icon" ? 19 : size === "lg" ? 20 : 17} aria-hidden="true" />
      {variant !== "icon" && (children ?? "WhatsApp")}
    </a>
  );
}
