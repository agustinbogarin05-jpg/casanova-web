// Hand-written mirrors of backend/models/catalog.py — keep in sync with the Pydantic models.

export type Availability = "in_stock" | "low_stock" | "on_request" | "out_of_stock";

export interface Spec {
  label: string;
  value: string; // empty = "a confirmar"
}

export interface ProductInput {
  name: string;
  short_description: string;
  description: string;
  category_id: string;
  price: number | null;
  previous_price: number | null;
  images: string[];
  availability: Availability;
  published: boolean;
  promo_label: string;
  specs: Spec[];
  includes: string[];
  warranty: string;
  tags: string[];
  related_ids: string[];
  best_seller: boolean;
  best_seller_rank: number;
  order: number;
  units_sold: number | null;
  installments_eligible: boolean;
  cash_discount_eligible: boolean;
  is_demo: boolean;
}

export interface Product extends ProductInput {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductPatch {
  price?: number | null;
  clear_price?: boolean;
  published?: boolean;
  best_seller?: boolean;
  best_seller_rank?: number;
  order?: number;
}

export interface CategoryInput {
  name: string;
  icon: string;
  order: number;
  visible: boolean;
}

export interface Category extends CategoryInput {
  id: string;
  slug: string;
}

export interface Settings {
  whatsapp_number: string;
  whatsapp_default_message: string;
  installments_enabled: boolean;
  installments_count: number;
  installments_conditions: string;
  cash_discount_enabled: boolean;
  cash_discount_percent: number;
  cash_discount_conditions: string;
  whatsapp_promo_enabled: boolean;
  carousel_autoplay: boolean;
  carousel_interval_seconds: number;
  best_sellers_sort_by_sales: boolean;
  show_demo_notice: boolean;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
}

export interface Catalog {
  products: Product[];
  categories: Category[];
  settings: Settings;
}

export interface AuthStatus {
  authenticated: boolean;
}

export interface UploadedImage {
  id: string;
  url: string;
}

export interface OkResponse {
  ok: boolean;
}

export interface ImportIssue {
  row: number;
  message: string;
}

export interface ImportRow {
  row: number;
  action: "create" | "update" | "unchanged";
  name: string;
  fields: string[];
}

export interface ImportResult {
  dry_run: boolean;
  created: number;
  updated: number;
  unchanged: number;
  errors: ImportIssue[];
  rows: ImportRow[];
}
