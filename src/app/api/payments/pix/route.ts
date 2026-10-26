import { NextRequest, NextResponse } from "next/server";
import {
  createMercadoPagoPix,
  checkMercadoPagoPayment,
  activatePlanInSupabase,
} from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      planId,
      planTitle,
      planPrice,
      planDays,
      payerEmail,
      payerName,
    } = body;

    if (!businessId || !planId || !planPrice) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos para geração de Pix." },
        { status: 400 }
      );
    }

    const pixData = await createMercadoPagoPix({
      amount: Number(planPrice),
      description: planTitle || "Assinatura Plano Feira Digital",
      payerEmail: payerEmail || "contato@feiradigital.com.br",
      payerName: payerName || "Empreendedor",
      businessId,
      planId,
      planDays: Number(planDays) || 30,
    });

    return NextResponse.json(pixData);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao processar cobrança Pix." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "paymentId é obrigatório." },
        { status: 400 }
      );
    }

    const check = await checkMercadoPagoPayment(paymentId);

    // Se estiver aprovado, garante que o plano já foi ativado
    if (check.isApproved && check.metadata?.business_id) {
      await activatePlanInSupabase({
        businessId: check.metadata.business_id,
        planId: check.metadata.plan_id || "pro_monthly",
        planDays: Number(check.metadata.plan_days) || 30,
        amount: check.amount,
        paymentId,
      });
    }

    return NextResponse.json(check);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao verificar status do pagamento." },
      { status: 500 }
    );
  }
}
