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
  created_at?: string;
  category?: Category;
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
