import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getBusinessSubscriptionInfo,
  processExpiredSubscriptions,
  generateEmailNotificationContent,
} from "@/lib/subscription";
import { Business } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Endpoint de automação de notificações por e-mail e rotina de ciclo de vida.
 * Pode ser chamado por um Cron Job diário (ex: Vercel Cron, Supabase pg_cron, EasyCron)
 * ou manualmente pelo painel administrativo.
 *
 * Ações executadas:
 * 1. Processa downgrades de planos cujo prazo de confiança de 5 dias já expirou (processExpiredSubscriptions).
 * 2. Identifica lojas a 3 dias do vencimento (Alerta Preventivo de Alta Conversão).
 * 3. Identifica lojas recém-vencidas (Aviso de Concessão de 5 Dias de Prazo de Confiança).
 * 4. Monta mensagens altamente persuasivas, amistosas e empáticas.
 * 5. Se houver serviço de e-mail configurado (RESEND_API_KEY ou SMTP), despacha os e-mails reais.
 *    Caso contrário, registra detalhadamente para auditoria e logs.
 */
export async function POST(req: Request) {
  try {
    const supabase = getAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase Admin client não configurado." },
        { status: 500 }
      );
    }

    // 1. Processar downgrade de quem já extrapolou os 5 dias de confiança
    const expiredCount = await processExpiredSubscriptions();

    // 2. Buscar todas as lojas para verificar status
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allBiz = (businesses || []) as Business[];
    const resendApiKey = process.env.RESEND_API_KEY;

    const notificationsSent: Array<{
      businessId: string;
      businessName: string;
      email: string | null;
      type: "expiring_soon_3d" | "grace_period_start";
      subject: string;
      delivered: boolean;
      mode: "api" | "logged";
    }> = [];

    for (const biz of allBiz) {
      const info = getBusinessSubscriptionInfo(biz);

      if (info.status === "expiring_soon" && info.daysRemaining <= 3 && info.daysRemaining >= 1) {
        const emailContent = generateEmailNotificationContent(biz, "expiring_soon");
        let delivered = false;

        if (biz.email && resendApiKey) {
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "Feira Digital <contato@feiradigital.com>",
                to: [biz.email],
                subject: emailContent.subject,
                text: emailContent.body,
              }),
            });
            delivered = res.ok;
          } catch (e) {
            console.error(`Erro ao enviar e-mail para ${biz.email}:`, e);
          }
        }

        notificationsSent.push({
          businessId: biz.id,
          businessName: biz.name,
          email: biz.email || null,
          type: "expiring_soon_3d",
          subject: emailContent.subject,
          delivered,
          mode: resendApiKey ? "api" : "logged",
        });
      } else if (info.status === "grace_period" && info.graceDaysRemaining === 5) {
        // Notificação de primeiro dia do prazo de confiança
        const emailContent = generateEmailNotificationContent(biz, "grace_period");
        let delivered = false;

        if (biz.email && resendApiKey) {
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "Feira Digital <contato@feiradigital.com>",
                to: [biz.email],
                subject: emailContent.subject,
                text: emailContent.body,
              }),
            });
            delivered = res.ok;
          } catch (e) {
            console.error(`Erro ao enviar e-mail para ${biz.email}:`, e);
          }
        }

        notificationsSent.push({
          businessId: biz.id,
          businessName: biz.name,
          email: biz.email || null,
          type: "grace_period_start",
          subject: emailContent.subject,
          delivered,
          mode: resendApiKey ? "api" : "logged",
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredDowngradesProcessed: expiredCount,
      totalNotificationsProcessed: notificationsSent.length,
      notificationsSent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Permite chamada via GET para ping de Uptime/Health check ou agendadores leves
  return POST(req);
}
