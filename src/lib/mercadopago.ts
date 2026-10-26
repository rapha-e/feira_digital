/**
 * Integração Oficial Mercado Pago - Pagamentos Pix em Tempo Real
 */

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const MP_API_URL = "https://api.mercadopago.com/v1/payments";

export interface CreatePixParams {
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  businessId: string;
  planId: string;
  planDays: number;
}

export interface PixPaymentResponse {
  success: boolean;
  paymentId?: string;
  status?: string;
  statusDetail?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  error?: string;
}

export async function createMercadoPagoPix({
  amount,
  description,
  payerEmail,
  payerName,
  businessId,
  planId,
  planDays,
}: CreatePixParams): Promise<PixPaymentResponse> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: "MERCADO_PAGO_ACCESS_TOKEN não configurado no servidor.",
    };
  }

  try {
    const cleanEmail = payerEmail && payerEmail.includes("@") ? payerEmail : "contato@feiradigital.com.br";
    const cleanName = payerName.trim() || "Empreendedor Feira Digital";
    const nameParts = cleanName.split(" ");
    const firstName = nameParts[0] || "Empreendedor";
    const lastName = nameParts.slice(1).join(" ") || "MEI";

    const body = {
      transaction_amount: Number(amount.toFixed(2)),
      description: description.slice(0, 50),
      payment_method_id: "pix",
      payer: {
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName,
      },
      metadata: {
        business_id: businessId,
        plan_id: planId,
        plan_days: planDays,
      },
      notification_url: "https://feira-digital-xi.vercel.app/api/payments/webhook",
    };

    const res = await fetch(MP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `pix-${businessId}-${planId}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      console.error("[MercadoPago Pix Error]", data);
      return {
        success: false,
        error: data.message || "Erro ao gerar cobrança Pix no Mercado Pago.",
      };
    }

    const transactionData = data.point_of_interaction?.transaction_data;

    return {
      success: true,
      paymentId: String(data.id),
      status: data.status,
      statusDetail: data.status_detail,
      qrCode: transactionData?.qr_code || "",
      qrCodeBase64: transactionData?.qr_code_base64 || "",
      ticketUrl: transactionData?.ticket_url || "",
    };
  } catch (err: any) {
    console.error("[MercadoPago Exception]", err);
    return {
      success: false,
      error: err.message || "Falha na comunicação com o Mercado Pago.",
    };
  }
}

export async function checkMercadoPagoPayment(paymentId: string) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return { success: false, error: "Token não configurado." };

  try {
    const res = await fetch(`${MP_API_URL}/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, error: "Pagamento não localizado." };
    }

    const data = await res.json();
    const isApproved = data.status === "approved";

    return {
      success: true,
      status: data.status,
      statusDetail: data.status_detail,
      isApproved,
      amount: data.transaction_amount,
      metadata: data.metadata || {},
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao consultar status." };
  }
}

/**
 * Ativação do Plano no Supabase após confirmação de pagamento
 */
export async function activatePlanInSupabase({
  businessId,
  planId,
  planDays,
  amount,
  paymentId,
}: {
  businessId: string;
  planId: string;
  planDays: number;
  amount?: number;
  paymentId?: string;
}) {
  if (!businessId) return false;

  const isDiamond = planId === "diamond_monthly";
  const isPro = planId === "pro_monthly";
  const newPlanTier = isDiamond ? "diamond" : isPro ? "pro" : "free";
  const newProductLimit = isDiamond ? 30 : isPro ? 15 : 5;
  const newIsVerified = isDiamond || isPro; // Pro e Diamante recebem selo oficial de MEI Verificado

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (planDays || 30));

  if (!isSupabaseConfigured()) {
    return true;
  }

  try {
    const supabase = getAdminSupabaseClient();

    // 1. Atualiza o cadastro do negócio
    const { error: bizErr } = await supabase
      .from("businesses")
      .update({
        is_featured: true,
        featured_until: expiresAt.toISOString(),
        plan_tier: newPlanTier,
        product_limit: newProductLimit,
        is_verified: newIsVerified,
      })
      .eq("id", businessId);

    if (bizErr) {
      console.error("[Activate Plan Error]", bizErr);
      return false;
    }

    // 2. Registra o histórico na tabela de promoções se existir
    try {
      await supabase.from("promotions").insert({
        business_id: businessId,
        type: planId,
        amount: amount || 0,
        status: "active",
        expires_at: expiresAt.toISOString(),
        payment_method: `mercadopago_pix:${paymentId || ""}`,
      });
    } catch {
      // Ignora erro em promotions se a tabela não tiver colunas extras
    }

    return true;
  } catch (err) {
    console.error("[Activate Plan Exception]", err);
    return false;
  }
}
