import { NextResponse } from "next/server";
import { processExpiredSubscriptions, getBusinessSubscriptionInfo } from "@/lib/subscription";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, message: "Modo mock", stats: {} });
    }

    // 1. Processa automaticamente downgrades para lojas que excederam os 5 dias de confiança
    const downgradeResult = await processExpiredSubscriptions();

    // 2. Consulta lojas ativas para auditoria do Admin
    const admin = getAdminSupabaseClient();
    const { data: businesses, error } = await admin
      .from("businesses")
      .select("id, name, slug, email, whatsapp, neighborhood, city, plan_tier, is_featured, featured_until, is_verified, product_limit")
      .order("created_at", { ascending: false });

    if (error || !businesses) {
      return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
    }

    const expiringSoon: any[] = [];
    const inGracePeriod: any[] = [];
    const activePaid: any[] = [];
    const freeTier: any[] = [];

    businesses.forEach(biz => {
      const sub = getBusinessSubscriptionInfo(biz);
      const enhancedBiz = {
        ...biz,
        subscription: sub,
      };

      if (sub.status === "expiring_soon") {
        expiringSoon.push(enhancedBiz);
      } else if (sub.status === "grace_period") {
        inGracePeriod.push(enhancedBiz);
      } else if (sub.status === "active") {
        activePaid.push(enhancedBiz);
      } else {
        freeTier.push(enhancedBiz);
      }
    });

    return NextResponse.json({
      success: true,
      downgradedCount: downgradeResult.downgradedCount,
      summary: {
        total: businesses.length,
        activePaid: activePaid.length,
        expiringSoon: expiringSoon.length,
        inGracePeriod: inGracePeriod.length,
        freeTier: freeTier.length,
      },
      expiringSoon,
      inGracePeriod,
      activePaid,
    });
  } catch (err: any) {
    console.error("[Subscription Check Error]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
