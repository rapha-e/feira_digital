export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  category_id: string | null;
  neighborhood: string;
  city: string;
  cnpj?: string | null;
  state?: string | null;
  cep?: string | null;
  street_address?: string | null;
  address_number?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
  whatsapp: string;
  avatar_url: string | null;
  bio: string | null;
  is_open?: boolean;
  free_delivery?: boolean;
  store_pickup?: boolean;
  accepts_pix?: boolean;
  accepts_card?: boolean;
  views_count?: number;
  whatsapp_clicks_count?: number;
  product_limit?: number;
  is_featured?: boolean;
  featured_until?: string | null;
  plan_tier?: "free" | "pro" | "diamond" | string;
  is_verified?: boolean;
  created_at?: string;
  category?: Category;
}

export interface Promotion {
  id: string;
  business_id: string;
  type: "boost_3_days" | "boost_7_days" | "pro_monthly" | string;
  amount: number;
  status: "pending" | "active" | "expired";
  starts_at?: string;
  expires_at: string;
  payment_method?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  custom_whatsapp_message?: string | null;
  created_at?: string;
}

export interface BusinessWithProducts extends Business {
  products: Product[];
  category?: Category;
}
