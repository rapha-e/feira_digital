import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Business, BusinessWithProducts, Category, Product } from "@/types";
import {
  INITIAL_BUSINESSES,
  INITIAL_CATEGORIES,
  incrementMockClick,
  incrementMockView,
  updateMockBusiness,
  deleteMockBusiness,
  addMockCategory,
  deleteMockCategory,
  updateMockCategory,
  updateMockProduct,
  deleteMockProduct,
} from "./mock-data";

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function getCategories(): Promise<Category[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [...INITIAL_CATEGORIES];
    }

    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*").order("name");

    if (error || !data || data.length === 0) {
      return [...INITIAL_CATEGORIES];
    }

    return data as Category[];
  } catch {
    return [...INITIAL_CATEGORIES];
  }
}

export async function getBusinesses(filters?: {
  categorySlug?: string;
  neighborhood?: string;
  query?: string;
  onlyOpen?: boolean;
}): Promise<BusinessWithProducts[]> {
  try {
    if (!isSupabaseConfigured()) {
      let filtered = [...INITIAL_BUSINESSES];

      if (filters?.onlyOpen) {
        filtered = filtered.filter(b => b.is_open !== false);
      }

      if (filters?.categorySlug) {
        filtered = filtered.filter(b => b.category?.slug === filters.categorySlug);
      }

      if (filters?.neighborhood) {
        const normNeighborhood = normalizeText(filters.neighborhood);
        filtered = filtered.filter(b =>
          normalizeText(b.neighborhood).includes(normNeighborhood)
        );
      }

      if (filters?.query) {
        const q = normalizeText(filters.query);
        filtered = filtered.filter(
          b =>
            normalizeText(b.name).includes(q) ||
            (b.bio && normalizeText(b.bio).includes(q)) ||
            b.products.some(p => normalizeText(p.title).includes(q))
        );
      }

      return filtered;
    }

    const supabase = await createClient();
    let queryBuilder = supabase
      .from("businesses")
      .select("*, category:categories(*), products(*)");

    if (filters?.onlyOpen) {
      queryBuilder = queryBuilder.eq("is_open", true);
    }

    if (filters?.neighborhood) {
      queryBuilder = queryBuilder.ilike("neighborhood", `%${filters.neighborhood}%`);
    }

    if (filters?.query) {
      queryBuilder = queryBuilder.ilike("name", `%${filters.query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error || !data || data.length === 0) {
      return [...INITIAL_BUSINESSES];
    }

    let results = data as BusinessWithProducts[];

    if (filters?.categorySlug) {
      results = results.filter(b => b.category?.slug === filters.categorySlug);
    }

    return results;
  } catch {
    return [...INITIAL_BUSINESSES];
  }
}

export async function getBusinessBySlug(slug: string): Promise<BusinessWithProducts | null> {
  try {
    if (!isSupabaseConfigured()) {
      const biz = INITIAL_BUSINESSES.find(b => b.slug === slug);
      return biz || null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("*, category:categories(*), products(*)")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      const biz = INITIAL_BUSINESSES.find(b => b.slug === slug);
      return biz || null;
    }

    return data as BusinessWithProducts;
  } catch {
    const biz = INITIAL_BUSINESSES.find(b => b.slug === slug);
    return biz || null;
  }
}

export async function recordStoreView(businessId: string): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      incrementMockView(businessId);
      return;
    }
    const supabase = await createClient();
    await supabase.rpc("increment_views", { business_id: businessId });
  } catch {
    incrementMockView(businessId);
  }
}

export async function recordWhatsAppClick(businessId: string): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      incrementMockClick(businessId);
      return;
    }
    const supabase = await createClient();
    await supabase.rpc("increment_clicks", { business_id: businessId });
  } catch {
    incrementMockClick(businessId);
  }
}

// ==========================================
// FUNÇÕES ADMINISTRATIVAS (PAINEL DO ADMIN)
// ==========================================

export async function getAllBusinessesAdmin(): Promise<BusinessWithProducts[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [...INITIAL_BUSINESSES];
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("*, category:categories(*), products(*)")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [...INITIAL_BUSINESSES];
    }
    return data as BusinessWithProducts[];
  } catch {
    return [...INITIAL_BUSINESSES];
  }
}

export async function updateBusinessAdmin(id: string, updates: Partial<Business>): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      updateMockBusiness(id, updates);
      return true;
    }
    const supabase = await createClient();
    const { error } = await supabase.from("businesses").update(updates).eq("id", id);
    return !error;
  } catch {
    updateMockBusiness(id, updates);
    return true;
  }
}

export async function deleteBusinessAdmin(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      deleteMockBusiness(id);
      return true;
    }
    const supabase = await createClient();
    const { error } = await supabase.from("businesses").delete().eq("id", id);
    return !error;
  } catch {
    deleteMockBusiness(id);
    return true;
  }
}

export async function createCategoryAdmin(category: { name: string; slug: string; icon?: string }): Promise<Category | null> {
  try {
    if (!isSupabaseConfigured()) {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: category.name,
        slug: category.slug,
        icon: category.icon || "Sparkles",
      };
      addMockCategory(newCat);
      return newCat;
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();

    if (error || !data) return null;
    return data as Category;
  } catch {
    return null;
  }
}

export async function updateCategoryAdmin(id: string, updates: Partial<Category>): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      updateMockCategory(id, updates);
      return true;
    }
    const supabase = await createClient();
    const { error } = await supabase.from("categories").update(updates).eq("id", id);
    return !error;
  } catch {
    updateMockCategory(id, updates);
    return true;
  }
}

export async function deleteCategoryAdmin(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      deleteMockCategory(id);
      return true;
    }
    const supabase = await createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    return !error;
  } catch {
    deleteMockCategory(id);
    return true;
  }
}

export async function updateProductAdmin(id: string, updates: Partial<Product>): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      updateMockProduct(id, updates);
      return true;
    }
    const supabase = await createClient();
    const { error } = await supabase.from("products").update(updates).eq("id", id);
    return !error;
  } catch {
    updateMockProduct(id, updates);
    return true;
  }
}

export async function deleteProductAdmin(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      deleteMockProduct(id);
      return true;
    }
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    return !error;
  } catch {
    deleteMockProduct(id);
    return true;
  }
}

