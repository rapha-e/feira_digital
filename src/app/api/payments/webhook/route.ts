import { NextRequest, NextResponse } from "next/server";
import { checkMercadoPagoPayment, activatePlanInSupabase } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get("data.id") || searchParams.get("id");
    const queryTopic = searchParams.get("type") || searchParams.get("topic");

    let paymentId = queryId;

    try {
      const body = await request.json();
      if (body?.data?.id) {
        paymentId = String(body.data.id);
      } else if (body?.id && (body?.type === "payment" || queryTopic === "payment")) {
        paymentId = String(body.id);
      }
    } catch {
      // Body vazio ou form-urlencoded
    }

    if (paymentId) {
      console.log(`[MercadoPago Webhook] Processando notificação para o pagamento ${paymentId}`);
      const check = await checkMercadoPagoPayment(paymentId);

      if (check.isApproved && check.metadata?.business_id) {
        await activatePlanInSupabase({
          businessId: check.metadata.business_id,
          planId: check.metadata.plan_id || "pro_monthly",
          planDays: Number(check.metadata.plan_days) || 30,
          amount: check.amount,
          paymentId,
        });
        console.log(`[MercadoPago Webhook] Sucesso! Plano ativado para loja ${check.metadata.business_id}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[MercadoPago Webhook Error]", err);
    // Sempre retorna 200 pro Mercado Pago não ficar reenviando em loop infinito
    return NextResponse.json({ received: true, error: err.message }, { status: 200 });
  }
}

// Suporte para requisições GET de verificação do Mercado Pago
export async function GET() {
  return NextResponse.json({ status: "Mercado Pago Webhook Feira Digital Ativo" });
}
