import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import NotFound from "@/pages/NotFound";
import { SiteLayout } from "@/components/catalog/SiteLayout";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
// Public pages share SiteLayout so the header (and its live search) stays mounted between routes.
export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
