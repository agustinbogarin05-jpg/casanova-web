import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-20 sm:px-6 lg:px-8" data-testid="not-found-page">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Error 404</p>
      <h1 className="text-3xl font-extrabold text-brand sm:text-4xl">Esta página no existe.</h1>
      <p className="text-ink">Volvé al catálogo para seguir explorando nuestros productos.</p>
      <Link
        to="/"
        data-testid="not-found-home-link"
        className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-cream transition-colors hover:bg-ink"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}
