import { createClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
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
      return [];
    }

    const supabase = await createClient();
    let queryBuilder = supabase
      .from("businesses")
      .select("*, category:categories(*), products(*)")
      .order("created_at", { ascending: false });

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

    if (error || !data) {
      return [];
    }

    let results = data as BusinessWithProducts[];

    if (filters?.categorySlug) {
      results = results.filter(b => b.category?.slug === filters.categorySlug);
    }

    return results;
  } catch {
    return [];
  }
}

export async function getBusinessBySlug(slug: string): Promise<BusinessWithProducts | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("*, category:categories(*), products(*)")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return null;
    }

    return data as BusinessWithProducts;
  } catch {
    return null;
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
      return [];
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("*, category:categories(*), products(*)")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as BusinessWithProducts[];
  } catch {
    return [];
  }
}

export type UpdateBusinessResult = {
  success: boolean;
  error?: string;
  warning?: string;
};

export async function updateBusinessAdmin(
  id: string,
  updates: Partial<Business>
): Promise<UpdateBusinessResult> {
  try {
    if (!isSupabaseConfigured()) {
      updateMockBusiness(id, updates);
      return { success: true };
    }
    const supabase = getAdminSupabaseClient();

    // 1. Tenta atualizar com todos os dados
    const { data, error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", id)
      .select();

    if (!error && data && data.length > 0) {
      return { success: true };
    }

    // 2. Se falhar por coluna inexistente no schema do Supabase (PGRST204)
    if (error && error.code === "PGRST204") {
      console.warn("Supabase schema cache sem colunas novas. Aplicando fallback de campos principais...", error.message);
      const fallbackUpdates: Record<string, unknown> = { ...updates };
      delete fallbackUpdates.is_featured;
      delete fallbackUpdates.featured_until;
      delete fallbackUpdates.plan_tier;
      delete fallbackUpdates.is_verified;
      delete fallbackUpdates.cep;
      delete fallbackUpdates.latitude;
      delete fallbackUpdates.longitude;
      delete fallbackUpdates.street_address;
      delete fallbackUpdates.address_number;
      delete fallbackUpdates.state;
      delete fallbackUpdates.cnpj;

      const fallbackRes = await supabase
        .from("businesses")
        .update(fallbackUpdates)
        .eq("id", id)
        .select();

      if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
        return {
          success: true,
          warning:
            "Nome da Loja, Slug e configurações foram atualizados com sucesso! (Aviso: para ativar o Destaque e Selos de forma persistente, execute o script SQL de migração no painel do Supabase).",
        };
      }
      return {
        success: false,
        error: fallbackRes.error?.message || error.message,
      };
    }

    // 3. Se não houver erro explícito mas nenhuma linha foi atualizada (bloqueio por RLS)
    if (!error && (!data || data.length === 0)) {
      return {
        success: false,
        error:
          "A atualização não foi gravada no Supabase (0 linhas afetadas). Execute o script de migração no SQL Editor do Supabase para autorizar atualizações do painel administrativo.",
      };
    }

    return {
      success: false,
      error: error?.message || "Erro desconhecido ao salvar no Supabase.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao conectar ao Supabase";
    updateMockBusiness(id, updates);
    return { success: true, warning: msg };
  }
}

export async function deleteBusinessAdmin(id: string): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      deleteMockBusiness(id);
      return true;
    }
    const supabase = getAdminSupabaseClient();
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
    const supabase = getAdminSupabaseClient();
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
    const supabase = getAdminSupabaseClient();
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
    const supabase = getAdminSupabaseClient();
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
    const supabase = getAdminSupabaseClient();
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
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    return !error;
  } catch {
    deleteMockProduct(id);
    return true;
  }
}

