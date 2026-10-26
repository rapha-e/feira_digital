import { createClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Business, BusinessWithProducts, Category, Product, Sponsor } from "@/types";
import {
  INITIAL_BUSINESSES,
  INITIAL_CATEGORIES,
  INITIAL_SPONSORS,
  incrementMockClick,
  incrementMockView,
  incrementMockSponsorClick,
  incrementMockSponsorView,
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
  strictNeighborhood?: boolean;
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

    if (filters?.strictNeighborhood && filters?.neighborhood) {
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
      return [...INITIAL_BUSINESSES];
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("*, category:categories(*), products(*)")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    // Tenta enriquecer com emails de auth.users via service role do admin
    try {
      const adminClient = getAdminSupabaseClient();
      const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
      if (!usersError && usersData?.users) {
        const emailMap = new Map<string, string>();
        usersData.users.forEach(u => {
          if (u.id && u.email) {
            emailMap.set(u.id, u.email);
          }
        });

        return (data as BusinessWithProducts[]).map(biz => ({
          ...biz,
          email: biz.email || emailMap.get(biz.user_id) || null,
        }));
      }
    } catch {
      // Caso não tenha permissão de admin.listUsers, prossegue com os dados nativos
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
      delete fallbackUpdates.email;

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

// ==========================================
// FUNÇÕES DE PUBLICIDADE & SPONSORS (B2B)
// ==========================================

export async function getActiveSponsors(placement: "home" | "painel" | "all" = "home"): Promise<Sponsor[]> {
  try {
    if (!isSupabaseConfigured()) {
      return INITIAL_SPONSORS.filter(s => s.is_active && (s.placement === placement || s.placement === "all"));
    }

    const supabase = await createClient();
    let query = supabase
      .from("sponsors")
      .select("*")
      .eq("is_active", true);

    if (placement !== "all") {
      query = query.or(`placement.eq.${placement},placement.eq.all`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_SPONSORS.filter(s => s.is_active && (s.placement === placement || s.placement === "all"));
    }

    return data as Sponsor[];
  } catch {
    return INITIAL_SPONSORS.filter(s => s.is_active && (s.placement === placement || s.placement === "all"));
  }
}

export async function getAllSponsorsAdmin(): Promise<Sponsor[]> {
  try {
    if (!isSupabaseConfigured()) {
      return [...INITIAL_SPONSORS];
    }
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from("sponsors").select("*").order("created_at", { ascending: false });
    if (error || !data) {
      return [...INITIAL_SPONSORS];
    }
    return data as Sponsor[];
  } catch {
    return [...INITIAL_SPONSORS];
  }
}

export async function recordSponsorView(sponsorId: string): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      incrementMockSponsorView(sponsorId);
      return;
    }
    const supabase = getAdminSupabaseClient();
    const { data } = await supabase.from("sponsors").select("views_count").eq("id", sponsorId).single();
    if (data) {
      await supabase.from("sponsors").update({ views_count: (data.views_count || 0) + 1 }).eq("id", sponsorId);
    }
  } catch {
    incrementMockSponsorView(sponsorId);
  }
}

export async function recordSponsorClick(sponsorId: string): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      incrementMockSponsorClick(sponsorId);
      return;
    }
    const supabase = getAdminSupabaseClient();
    const { data } = await supabase.from("sponsors").select("clicks_count").eq("id", sponsorId).single();
    if (data) {
      await supabase.from("sponsors").update({ clicks_count: (data.clicks_count || 0) + 1 }).eq("id", sponsorId);
    }
  } catch {
    incrementMockSponsorClick(sponsorId);
  }
}

export async function toggleSponsorActive(sponsorId: string, isActive: boolean): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      const spon = INITIAL_SPONSORS.find(s => s.id === sponsorId);
      if (spon) spon.is_active = isActive;
      return true;
    }
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from("sponsors").update({ is_active: isActive }).eq("id", sponsorId);
    return !error;
  } catch {
    return false;
  }
}

export async function createSponsorAdmin(sponsorData: Partial<Sponsor>): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      INITIAL_SPONSORS.unshift({
        id: `spon-${Date.now()}`,
        name: sponsorData.name || "Novo Parceiro",
        title: sponsorData.title || "Oferta Especial",
        subtitle: sponsorData.subtitle || "",
        image_url: sponsorData.image_url || null,
        target_url: sponsorData.target_url || "https://wa.me/5561999999999",
        placement: sponsorData.placement || "home",
        cta_text: sponsorData.cta_text || "Saiba Mais",
        badge_text: sponsorData.badge_text || "Parceiro Oficial",
        is_active: true,
        views_count: 0,
        clicks_count: 0,
        created_at: new Date().toISOString(),
      });
      return true;
    }
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from("sponsors").insert([sponsorData]);
    return !error;
  } catch {
    return false;
  }
}


