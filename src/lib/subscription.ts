/**
 * Gestão de Ciclo de Vida de Planos, Campanhas e Período de Confiança (Grace Period)
 * Feira Digital - Regras de Negócio Oficiais
 */

import { Business } from "@/types";
import { getAdminSupabaseClient } from "./supabase/admin";
import { isSupabaseConfigured } from "./supabase/config";

export const PLAN_LIMITS = {
  free: {
    title: "Plano Grátis",
    productLimit: 5,
    hasFeatured: false,
    hasVerifiedBadge: false,
    allCities: false,
    price: 0,
    days: 0,
  },
  turbo_3_days: {
    title: "Turbo Fim de Semana (3 Dias)",
    productLimit: 5,
    hasFeatured: true,
    hasVerifiedBadge: false,
    allCities: false,
    price: 9.90,
    days: 3,
  },
  semana_7_days: {
    title: "Semana de Sucesso (7 Dias de Pico)",
    productLimit: 5,
    hasFeatured: true,
    hasVerifiedBadge: false,
    allCities: false,
    price: 19.90,
    days: 7,
  },
  pro: {
    title: "Assinatura MEI Pro",
    productLimit: 15, // Atualizado para até 15 produtos
    hasFeatured: true,
    hasVerifiedBadge: true,
    allCities: false,
    price: 29.90,
    days: 30,
  },
  diamond: {
    title: "Catálogo Diamante",
    productLimit: 30, // Atualizado para até 30 produtos
    hasFeatured: true,
    hasVerifiedBadge: true,
    allCities: true, // Destaque em todas as cidades!
    price: 49.90,
    days: 30,
  },
} as const;

export type SubscriptionStatus =
  | "free" // Plano gratuito permanente
  | "active" // Assinatura paga em dia
  | "expiring_soon" // A vencer nos próximos 3 dias
  | "grace_period" // Vencida, mas no período de confiança de 5 dias
  | "expired"; // Prazo de confiança de 5 dias esgotado (rebaixado para free)

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  planTier: string;
  planTitle: string;
  isFeatured: boolean;
  isVerified: boolean;
  productLimit: number;
  featuredUntil: Date | null;
  gracePeriodUntil: Date | null;
  daysRemaining: number;
  graceDaysRemaining: number;
  inGracePeriod: boolean;
  badgeLabel: string;
  badgeColor: string;
}

/**
 * Calcula o status exato da assinatura de um negócio
 */
export function getBusinessSubscriptionInfo(biz: Partial<Business>): SubscriptionInfo {
  const planTier = biz.plan_tier || "free";
  const isPaidPlan = planTier === "pro" || planTier === "diamond" || Boolean(biz.is_featured);

  if (!isPaidPlan || !biz.featured_until) {
    return {
      status: "free",
      planTier: "free",
      planTitle: "Plano Grátis",
      isFeatured: false,
      isVerified: Boolean(biz.is_verified),
      productLimit: 5,
      featuredUntil: null,
      gracePeriodUntil: null,
      daysRemaining: 0,
      graceDaysRemaining: 0,
      inGracePeriod: false,
      badgeLabel: "Plano Grátis",
      badgeColor: "stone",
    };
  }

  const now = new Date();
  const featuredUntil = new Date(biz.featured_until);
  const gracePeriodUntil = new Date(featuredUntil.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 dias de confiança

  const msRemaining = featuredUntil.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  const msGraceRemaining = gracePeriodUntil.getTime() - now.getTime();
  const graceDaysRemaining = Math.ceil(msGraceRemaining / (1000 * 60 * 60 * 24));

  const planTitle =
    planTier === "diamond"
      ? "Catálogo Diamante"
      : planTier === "pro"
      ? "Assinatura MEI Pro"
      : "Destaque Patrocinado";

  const productLimit =
    planTier === "diamond" ? 30 : planTier === "pro" ? 15 : 5;

  // 1. Já esgotou até o período de confiança (mais de 5 dias após vencimento)
  if (msGraceRemaining <= 0) {
    return {
      status: "expired",
      planTier: "free",
      planTitle: "Plano Grátis (Expirado)",
      isFeatured: false,
      isVerified: false,
      productLimit: 5,
      featuredUntil,
      gracePeriodUntil,
      daysRemaining: 0,
      graceDaysRemaining: 0,
      inGracePeriod: false,
      badgeLabel: "Expirado (Grátis)",
      badgeColor: "red",
    };
  }

  // 2. Vencido, mas dentro dos 5 dias de confiança (Grace Period)
  if (msRemaining <= 0 && msGraceRemaining > 0) {
    return {
      status: "grace_period",
      planTier,
      planTitle,
      isFeatured: true, // Mantém o destaque por confiança
      isVerified: true,
      productLimit,
      featuredUntil,
      gracePeriodUntil,
      daysRemaining: 0,
      graceDaysRemaining,
      inGracePeriod: true,
      badgeLabel: `Prazo de Confiança (${graceDaysRemaining}d restantes)`,
      badgeColor: "amber",
    };
  }

  // 3. A vencer nos próximos 3 dias
  if (daysRemaining <= 3 && daysRemaining > 0) {
    return {
      status: "expiring_soon",
      planTier,
      planTitle,
      isFeatured: true,
      isVerified: true,
      productLimit,
      featuredUntil,
      gracePeriodUntil,
      daysRemaining,
      graceDaysRemaining: 5,
      inGracePeriod: false,
      badgeLabel: `Vence em ${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}`,
      badgeColor: "yellow",
    };
  }

  // 4. Assinatura ativa normalmente
  return {
    status: "active",
    planTier,
    planTitle,
    isFeatured: true,
    isVerified: true,
    productLimit,
    featuredUntil,
    gracePeriodUntil,
    daysRemaining,
    graceDaysRemaining: 5,
    inGracePeriod: false,
    badgeLabel: `${planTitle} (${daysRemaining}d)`,
    badgeColor: planTier === "diamond" ? "blue" : "purple",
  };
}

/**
 * Textos e Mensagens de Alta Conversão, Empatia e Escassez para WhatsApp
 */
export function generateWhatsAppRenewalMessage(
  biz: Partial<Business>,
  type: "expiring_soon" | "grace_period" | "expired"
): string {
  const storeName = biz.name || "Empreendedor";
  const planName =
    biz.plan_tier === "diamond"
      ? "Catálogo Diamante"
      : biz.plan_tier === "pro"
      ? "Plano MEI Pro"
      : "Destaque no Topo";

  const painelUrl = "https://feiradigital.com.br/painel";

  if (type === "expiring_soon") {
    return encodeURIComponent(
      `Olá, equipe da *${storeName}*! Tudo bem com vocês? Aqui é da coordenação da Feira Digital! 🌟\n\n` +
      `Passando para parabenizar pelas vitrines ativas! Clientes da sua região estão descobrindo sua loja direto pelo WhatsApp todos os dias.\n\n` +
      `⚠️ Notamos que o seu plano *${planName}* vence nos próximos dias. Como você sabe, estar nas *primeiras posições da busca* garante até 3x mais contatos e pedidos fechados no seu WhatsApp.\n\n` +
      `Para você não perder essa visibilidade de ouro e continuar recebendo novos pedidos sem interrupção, você já pode renovar com 1 clique pelo seu painel:\n\n` +
      `👉 Acesse seu painel: ${painelUrl}\n\n` +
      `Qualquer dúvida ou caso queira ajuda para cadastrar novas fotos, é só me chamar por aqui! Um grande abraço e ótimas vendas! 🚀`
    );
  }

  if (type === "grace_period") {
    return encodeURIComponent(
      `Olá, amigos da *${storeName}*! Tudo bem por aí? Aqui é da Feira Digital! 👋\n\n` +
      `Vimos que a assinatura do seu *${planName}* venceu, mas sabemos da correria do dia a dia do microempreendedor. Por isso, como *gesto de total parceria e confiança*, nós *NÃO retiramos* sua loja do topo!\n\n` +
      `🎁 Liberamos para você um *Prazo de Confiança Especial de 5 dias* para que você continue aparecendo no topo e não perca nenhum cliente que está buscando no seu bairro agora!\n\n` +
      `Para manter seu destaque garantido e continuar com o selo verificado ativo, basta concluir a renovação pelo Pix dinâmico no painel:\n\n` +
      `👉 Renovar agora no Painel: ${painelUrl}\n\n` +
      `Estamos muito felizes em ter a *${storeName}* crescendo com a gente. Se precisar de uma força com o Pix ou suporte, estou à disposição! Um abraço carinhoso! 💚`
    );
  }

  // Expired
  return encodeURIComponent(
    `Olá, pessoal da *${storeName}*! Tudo bem? Sentimos sua falta aqui no topo da Feira Digital! 😊\n\n` +
    `O prazo de confiança do seu plano expirou e sua vitrine retornou temporariamente ao plano inicial. As buscas por produtos e serviços na sua região continuam super aquecidas!\n\n` +
    `Queremos muito ver você de volta em 1º lugar com selo dourado de destaque. É super rápido reativar:\n\n` +
    `👉 Reativar meu Destaque: ${painelUrl}\n\n` +
    `Conte sempre com a Feira Digital para fortalecer suas vendas! Boas vendas e um abraço! ✨`
  );
}

/**
 * Conteúdo de E-mail para Lojistas
 */
export function generateEmailRenewalContent(
  biz: Partial<Business>,
  type: "expiring_soon" | "grace_period"
) {
  const storeName = biz.name || "Empreendedor";
  const planName =
    biz.plan_tier === "diamond" ? "Catálogo Diamante" : "Assinatura MEI Pro";

  if (type === "expiring_soon") {
    return {
      subject: `⏰ ${storeName}: Seu destaque no topo vence em breve - Não perca seus clientes!`,
      html: `
        <div style="font-family: sans-serif; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; rounded: 16px;">
          <h2 style="color: #059669; margin-top: 0;">Olá, equipe da ${storeName}! 🌟</h2>
          <p style="font-size: 15px; line-height: 1.6;">
            Esperamos que suas vendas estejam a todo vapor! Passamos para lembrar que seu <strong>${planName}</strong> está chegando ao término do ciclo.
          </p>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              ⚡ <strong>Por que a continuidade importa?</strong> Lojas no topo recebem em média <strong>3 vezes mais contatos diretos no WhatsApp</strong>. Ao renovar antes do vencimento, você não perde o posicionamento privilegiado para os vizinhos da sua região.
            </p>
          </div>
          <p style="font-size: 15px; line-height: 1.6;">
            A renovação é instantânea via Pix oficial pelo seu painel de controle:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://feiradigital.com.br/painel" style="background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
              Renovar Meu Destaque Agora
            </a>
          </div>
          <p style="font-size: 13px; color: #78716c;">
            Com carinho e votos de muito sucesso,<br/>
            <strong>Equipe Feira Digital</strong>
          </p>
        </div>
      `,
    };
  }

  return {
    subject: `🤝 ${storeName}: Liberamos 5 dias de prazo de confiança para você!`,
    html: `
      <div style="font-family: sans-serif; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; rounded: 16px;">
        <h2 style="color: #059669; margin-top: 0;">Olá, amigos da ${storeName}! 👋</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Notamos que o ciclo do seu <strong>${planName}</strong> venceu hoje. Sabemos muito bem que o dia a dia do microempreendedor é corrido e cheio de desafios!
        </p>
        <div style="background-color: #ecfdf5; border: 2px solid #10b981; padding: 18px; margin: 20px 0; border-radius: 12px; text-align: center;">
          <h3 style="color: #065f46; margin: 0 0 8px 0;">🎁 Prazo de Confiança Ativo: +5 Dias Grátis</h3>
          <p style="margin: 0; font-size: 14px; color: #047857; line-height: 1.5;">
            Como valorizamos muito a sua presença na Feira Digital, <strong>não removemos sua loja do topo</strong>! Você tem 5 dias corridos para efetuar a renovação sem interrupções nas suas mensagens no WhatsApp.
          </p>
        </div>
        <p style="font-size: 15px; line-height: 1.6;">
          Para garantir seu selo de destaque e o limite expandido de produtos, conclua o Pix no painel:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://feiradigital.com.br/painel" style="background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
            Garantir Minha Renovação no Painel
          </a>
        </div>
        <p style="font-size: 13px; color: #78716c;">
          Obrigado pela confiança e parceria de sempre!<br/>
          <strong>Equipe Feira Digital</strong>
        </p>
      </div>
    `,
  };
}

/**
 * Rotina Automática de Downgrade: Rebaixa lojas que ultrapassaram o Prazo de Confiança (5 dias pós-vencimento)
 */
export async function processExpiredSubscriptions(): Promise<{
  downgradedCount: number;
  downgradedIds: string[];
}> {
  if (!isSupabaseConfigured()) {
    return { downgradedCount: 0, downgradedIds: [] };
  }

  try {
    const admin = getAdminSupabaseClient();
    const now = new Date();
    // 5 dias atrás
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    // Seleciona lojas destacadas cujo featured_until é anterior a 5 dias atrás
    const { data: expiredBusinesses, error } = await admin
      .from("businesses")
      .select("id, name, featured_until, plan_tier")
      .eq("is_featured", true)
      .not("featured_until", "is", null)
      .lt("featured_until", fiveDaysAgo.toISOString());

    if (error || !expiredBusinesses || expiredBusinesses.length === 0) {
      return { downgradedCount: 0, downgradedIds: [] };
    }

    const downgradedIds: string[] = [];

    for (const biz of expiredBusinesses) {
      const { error: updateErr } = await admin
        .from("businesses")
        .update({
          is_featured: false,
          plan_tier: "free",
          product_limit: 5,
          is_verified: false,
        })
        .eq("id", biz.id);

      if (!updateErr) {
        downgradedIds.push(biz.id);
        console.log(`[Subscription Manager] Loja "${biz.name}" (${biz.id}) rebaixada para plano grátis após esgotar 5 dias de confiança.`);
      }
    }

    return {
      downgradedCount: downgradedIds.length,
      downgradedIds,
    };
  } catch (err) {
    console.error("[Subscription Manager Exception]", err);
    return { downgradedCount: 0, downgradedIds: [] };
  }
}

/**
 * Gera conteúdo de e-mail empático, simpático e de alta conversão
 */
export function generateEmailNotificationContent(
  biz: Partial<Business>,
  type: "expiring_soon" | "grace_period"
): { subject: string; body: string } {
  const storeName = biz.name || "Empreendedor(a)";
  const city = biz.city || "sua região";
  const planInfo = getBusinessSubscriptionInfo(biz);

  if (type === "expiring_soon") {
    return {
      subject: `🌟 ${storeName}: Faltam apenas ${planInfo.daysRemaining} dias para renovar seu destaque no topo da Feira Digital!`,
      body: `Olá, equipe da ${storeName}! Tudo bem com vocês? Esperamos que as vendas estejam a todo vapor! 🚀

Passamos aqui com muito carinho para lembrar que a sua assinatura do ${planInfo.planTitle} na Feira Digital vence em ${planInfo.daysRemaining} dias.

Estar em destaque no topo da vitrine de ${city} faz toda a diferença para o seu negócio ser a primeira escolha dos clientes da sua região, recebendo pedidos diretos no seu WhatsApp todos os dias. Quando o destaque acaba, outras lojas da sua categoria assumem as primeiras posições da vitrine.

Para garantir que sua loja não perca a posição privilegiada nem o selo de verificação, basta renovar com Pix instantâneo acessando seu painel:

👉 Acesse seu painel e renove agora: https://feiradigital.app/painel

Se precisar de qualquer ajuda, nossa equipe está 100% à sua disposição.

Com admiração pelo seu trabalho,
Equipe Feira Digital 💚`,
    };
  }

  // grace_period
  return {
    subject: `🤝 ${storeName}: Sua fatura venceu, mas liberamos 5 dias de Prazo de Confiança no topo para você!`,
    body: `Olá, parceiro(a) da ${storeName}! Como estão as coisas por aí?

Sabemos que a rotina de quem empreende é cheia de desafios e tarefas diárias. Por isso, valorizamos demais a nossa parceria e o seu trabalho!

A sua fatura do ${planInfo.planTitle} venceu recentemente. Em outras plataformas seu destaque seria suspenso na mesma hora, mas aqui na Feira Digital nós confiamos no seu trabalho. 

Por isso, ativamos para você o nosso PRAZO DE CONFIANÇA DE 5 DIAS! 🎁
Sua loja continuará aparecendo com destaque no topo e com todos os seus produtos e selo de verificação ativos durante esses 5 dias, garantindo que você não perca nenhuma venda ou cliente em andamento.

Após esse período de cortesia, o sistema ajustará sua loja automaticamente para o plano gratuito (até 5 produtos e sem prioridade de destaque no topo).

Para manter sua vitrine turbinada e continuar recebendo clientes qualificados todos os dias, renove sua assinatura de forma rápida e segura:

👉 Renove agora no painel: https://feiradigital.app/painel

Qualquer dúvida ou se precisar de um suporte especial, estamos sempre prontos para te apoiar no WhatsApp!

Um grande abraço de toda a família Feira Digital! 🌱`,
  };
}
