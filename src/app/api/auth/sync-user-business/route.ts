import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: "Supabase não configurado" }, { status: 400 });
    }

    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json({ success: false, error: "Identificação de usuário necessária" }, { status: 400 });
    }

    const admin = getAdminSupabaseClient();

    // 1. Tenta buscar primeiro pelo user_id
    let biz: any = null;
    if (userId) {
      const { data: byUserId, error: errUserId } = await admin
        .from("businesses")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!errUserId && byUserId) {
        biz = byUserId;
      }
    }

    // 2. Se não encontrou pelo user_id, busca pelo email cadastrado (ex: lojas criadas manualmente pelo admin)
    if (!biz && email) {
      const cleanEmail = email.trim().toLowerCase();
      const { data: byEmail, error: errEmail } = await admin
        .from("businesses")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (!errEmail && byEmail) {
        biz = byEmail;

        // Auto-heal / Sincronização definitiva: se o user_id for diferente do userId logado, vincula agora
        if (userId && byEmail.user_id !== userId) {
          console.log(`[Sync Business] Vinculando loja ${byEmail.name} (${byEmail.id}) ao user_id ${userId} (email: ${cleanEmail})`);
          await admin
            .from("businesses")
            .update({ user_id: userId })
            .eq("id", byEmail.id);
          biz.user_id = userId;
        }
      }
    }

    // Se nenhuma loja foi encontrada para esse usuário/email
    if (!biz) {
      return NextResponse.json({ success: false, business: null, products: [] });
    }

    // 3. Carrega os produtos da loja encontrada
    const { data: products, error: prodErr } = await admin
      .from("products")
      .select("*")
      .eq("business_id", biz.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      business: biz,
      products: products || [],
    });
  } catch (err: any) {
    console.error("[Sync User Business Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erro interno ao sincronizar negócio" },
      { status: 500 }
    );
  }
}
