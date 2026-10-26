import { useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export interface ScrollState {
  scrollTo?: string;
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Search (`q`) and category (`cat`) live in the URL so header, catalog and back-button stay in sync. */
export function useCatalogParams() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === "/";
  const q = onHome ? (params.get("q") ?? "") : "";
  const cat = onHome ? (params.get("cat") ?? "") : "";

  const update = useCallback(
    (changes: Record<string, string | null>, opts: { scroll?: boolean } = {}) => {
      const next = new URLSearchParams(onHome ? params : undefined);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (onHome) {
        setParams(next, {
          replace: true,
          preventScrollReset: true,
          state: opts.scroll ? ({ scrollTo: "catalogo" } satisfies ScrollState) : undefined,
        });
      } else {
        const search = next.toString();
        navigate({ pathname: "/", search: search ? `?${search}` : "" }, { state: { scrollTo: "catalogo" } satisfies ScrollState });
      }
    },
    [onHome, params, setParams, navigate],
  );

  const goToSection = useCallback(
    (id: string) => {
      if (onHome) scrollToId(id);
      else navigate("/", { state: { scrollTo: id } satisfies ScrollState });
    },
    [onHome, navigate],
  );

  return { q, cat, update, goToSection };
}
