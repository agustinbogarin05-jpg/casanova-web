import { Cable, Camera, House, Lamp, Lightbulb, Plug, ShieldCheck, Sparkles, Wifi, type LucideIcon } from "lucide-react";

/** Icon keys stored in Category.icon — editable from the admin panel. */
export const CATEGORY_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  lightbulb: { label: "Lamparita", icon: Lightbulb },
  shield: { label: "Escudo", icon: ShieldCheck },
  wifi: { label: "WiFi", icon: Wifi },
  lamp: { label: "Lámpara", icon: Lamp },
  plug: { label: "Enchufe", icon: Plug },
  cable: { label: "Cable", icon: Cable },
  camera: { label: "Cámara", icon: Camera },
  house: { label: "Casa", icon: House },
  sparkles: { label: "Destellos", icon: Sparkles },
};

export function CategoryIcon({ icon, className }: { icon?: string; className?: string }) {
  const Icon = CATEGORY_ICONS[icon ?? ""]?.icon ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
