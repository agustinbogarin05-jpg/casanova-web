# CASANOVA – catálogo estático con pedido por WhatsApp

Sin servidor ni base de datos. Los productos y la configuración están en `src/data/catalog.json`.

## Probar en tu PC (opcional)
    npm install
    npm run dev

## Publicar gratis (Cloudflare Pages o Netlify)
- Subí esta carpeta a un repositorio de GitHub y conectalo.
- Build command: `npm run build`
- Output directory: `dist`

## Cambiar productos, precios, WhatsApp, cuotas y descuento
Editá `src/data/catalog.json` y volvé a subir. Poné `"show_demo_notice": false` cuando cargues los productos reales.
