import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "md" | "lg";
  testId?: string;
  /** Header on phones: fills the space left next to the buttons and shrinks the wordmark only if needed,
   *  so logo + WhatsApp + menu always stay on ONE line (any screen width or text-size setting). */
  fluid?: boolean;
}

/** Official CASANOVA logo: house mark + CASANOVA wordmark (no tagline). */
export function Logo({ className, size = "md", testId = "brand-logo-link", fluid = false }: LogoProps) {
  return (
    <Link
      to="/"
      data-testid={testId}
      aria-label="CASANOVA, ir al inicio del catálogo"
      className={cn(
        "group items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal sm:gap-3",
        fluid ? "flex w-full min-w-0" : "inline-flex shrink-0",
        className,
      )}
    >
      <img
        src="/logo-mark.png"
        alt=""
        width={38}
        height={44}
        className={cn(
          "w-auto shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5",
          size === "lg" ? "h-12" : "h-[44px]",
        )}
      />
      {fluid ? (
        <span className="min-w-0 flex-1 md:flex-none">
          <img
            src="/logo-name.png"
            alt="CASANOVA"
            width={199}
            height={24}
            className="block h-auto w-full max-w-[199px] sm:max-w-[207px] md:w-[207px]"
          />
        </span>
      ) : (
        <img
          src="/logo-name.png"
          alt="CASANOVA"
          width={199}
          height={24}
          className={cn("w-auto", size === "lg" ? "h-7" : "h-6 sm:h-[25px]")}
        />
      )}
    </Link>
  );
}
