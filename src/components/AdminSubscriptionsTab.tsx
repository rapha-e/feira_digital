"use client";

import React, { useState } from "react";
import { BusinessWithProducts } from "@/types";
import {
  getBusinessSubscriptionInfo,
  generateWhatsAppRenewalMessage,
  SubscriptionInfo,
} from "@/lib/subscription";
import { formatDisplayPhone } from "@/lib/whatsapp";
import { adminUpdateBusiness } from "@/app/actions";
import {
  Sparkles,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  DollarSign,
  Search,
} from "lucide-react";

interface AdminSubscriptionsTabProps {
  businesses: BusinessWithProducts[];
  onRefresh: () => void;
}

export function AdminSubscriptionsTab({ businesses, onRefresh }: AdminSubscriptionsTabProps) {
  const [filter, setFilter] = useState<"all" | "attention" | "expiring_soon" | "grace_period" | "active" | "expired">("attention");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mapeia todas as lojas com informações detalhadas de assinatura
  const enrichedBusinesses = businesses.map(biz => ({
    ...biz,
    sub: getBusinessSubscriptionInfo(biz),
  }));

  // Contadores
  const expiringSoonCount = enrichedBusinesses.filter(b => b.sub.status === "expiring_soon").length;
  const gracePeriodCount = enrichedBusinesses.filter(b => b.sub.status === "grace_period").length;
  const activeCount = enrichedBusinesses.filter(b => b.sub.status === "active").length;
  const expiredCount = enrichedBusinesses.filter(b => b.sub.status === "expired").length;
  const attentionCount = expiringSoonCount + gracePeriodCount;

  // Filtragem
  const filtered = enrichedBusinesses.filter(biz => {
    // Filtro por status
    if (filter === "attention") {
      if (biz.sub.status !== "expiring_soon" && biz.sub.status !== "grace_period") return false;
    } else if (filter !== "all" && biz.sub.status !== filter) {
      return false;
    }

    // Busca textual
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (biz.name || "").toLowerCase().includes(q);
      const matchEmail = (biz.email || "").toLowerCase().includes(q);
      const matchNeighborhood = (biz.neighborhood || "").toLowerCase().includes(q);
      const matchPhone = (biz.whatsapp || "").includes(q);
      if (!matchName && !matchEmail && !matchNeighborhood && !matchPhone) return false;
    }

    return true;
  });

  // Ação de Renovação Rápida de 30 dias pelo Admin
  const handleQuickRenew = async (biz: typeof enrichedBusinesses[0], days = 30) => {
    if (!confirm(`Deseja adicionar +${days} dias de Destaque no Topo para a loja "${biz.name}"?`)) return;

    setUpdatingId(biz.id);
    const newExpiresAt = new Date();
    // Se a loja ainda estava ativa, soma aos dias restantes, senão começa de hoje
    const baseDate = biz.sub.featuredUntil && biz.sub.featuredUntil > newExpiresAt
      ? biz.sub.featuredUntil
      : newExpiresAt;

    baseDate.setDate(baseDate.getDate() + days);

    const isDiam = biz.plan_tier === "diamond";
    const res = await adminUpdateBusiness(biz.id, {
      is_featured: true,
      featured_until: baseDate.toISOString(),
      plan_tier: isDiam ? "diamond" : "pro",
      product_limit: isDiam ? 30 : 15,
      is_verified: true,
    });

    setUpdatingId(null);
    if (res.success) {
      onRefresh();
    } else {
      alert("Erro ao renovar: " + res.error);
    }
  };

  const handleCopyMessage = (biz: typeof enrichedBusinesses[0], type: "expiring_soon" | "grace_period" | "expired") => {
    const rawMsg = decodeURIComponent(generateWhatsAppRenewalMessage(biz, type));
    navigator.clipboard.writeText(rawMsg);
    setCopiedId(biz.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 border border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-400 text-stone-950 font-black">
                <Sparkles className="w-5 h-5 fill-stone-950" />
              </span>
              <h2 className="text-xl font-black tracking-tight">
                Gestão de Assinaturas & Prazo de Confiança
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Monitore o vencimento de planos, aplique o prazo de tolerância de 5 dias e envie mensagens empáticas de alta conversão direto para o WhatsApp do lojista.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-stone-700 transition-all cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar Auditoria</span>
          </button>
        </div>

        {/* 4 Cards de Métricas de Vencimento */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Alerta de Urgência: Atenção Imediata */}
          <div
            onClick={() => setFilter("attention")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              filter === "attention"
                ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30"
                : "bg-stone-800/60 border-stone-700/80 hover:bg-stone-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Atenção Imediata
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {attentionCount} <span className="text-xs font-normal text-amber-300/80">lojas</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              {expiringSoonCount} a vencer + {gracePeriodCount} em tolerância
            </p>
          </div>

          {/* Prazo de Confiança Ativo */}
          <div
            onClick={() => setFilter("grace_period")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              filter === "grace_period"
                ? "bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/30"
                : "bg-stone-800/60 border-stone-700/80 hover:bg-stone-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Prazo de Confiança
              </span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {gracePeriodCount} <span className="text-xs font-normal text-emerald-300/80">lojas</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Vencidas há menos de 5 dias (destaque mantido)
            </p>
          </div>

          {/* A Vencer nos Próximos 3 Dias */}
          <div
            onClick={() => setFilter("expiring_soon")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              filter === "expiring_soon"
                ? "bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-400/30"
                : "bg-stone-800/60 border-stone-700/80 hover:bg-stone-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                Vence em até 3 Dias
              </span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {expiringSoonCount} <span className="text-xs font-normal text-yellow-300/80">lojas</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Lembrete preventivo de renovação
            </p>
          </div>

          {/* Assinaturas Ativas */}
          <div
            onClick={() => setFilter("active")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              filter === "active"
                ? "bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/30"
                : "bg-stone-800/60 border-stone-700/80 hover:bg-stone-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Ativas em Dia
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {activeCount} <span className="text-xs font-normal text-blue-300/80">lojas</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Destaque regular e verificado ativos
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por loja, WhatsApp ou bairro..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-bold">
          <button
            onClick={() => setFilter("attention")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              filter === "attention" ? "bg-amber-500 text-stone-950 shadow-xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            ⚠️ Atenção ({attentionCount})
          </button>
          <button
            onClick={() => setFilter("grace_period")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              filter === "grace_period" ? "bg-emerald-600 text-white shadow-xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            🤝 Confiança ({gracePeriodCount})
          </button>
          <button
            onClick={() => setFilter("expiring_soon")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              filter === "expiring_soon" ? "bg-yellow-500 text-stone-950 shadow-xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            ⏰ A Vencer ({expiringSoonCount})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              filter === "active" ? "bg-blue-600 text-white shadow-xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            ✨ Ativas ({activeCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              filter === "all" ? "bg-stone-900 text-white shadow-xs" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Todas ({enrichedBusinesses.length})
          </button>
        </div>
      </div>

      {/* Lista de Lojas com Ação de WhatsApp de Alta Conversão */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">
              Nenhuma assinatura pendente no filtro selecionado!
            </h3>
            <p className="text-xs text-stone-500">
              Todas as lojas estão em dia ou não há empreendedores requerendo contato no momento.
            </p>
          </div>
        ) : (
          filtered.map(biz => {
            const isGrace = biz.sub.status === "grace_period";
            const isExpiring = biz.sub.status === "expiring_soon";
            const isExpired = biz.sub.status === "expired";
            const cleanPhone = (biz.whatsapp || "").replace(/\D/g, "");
            const waPhone = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;

            const msgType = isGrace ? "grace_period" : isExpiring ? "expiring_soon" : "expired";
            const waUrl = cleanPhone
              ? `https://wa.me/${waPhone}?text=${generateWhatsAppRenewalMessage(biz, msgType)}`
              : null;

            return (
              <div
                key={biz.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isGrace
                    ? "border-amber-300 bg-amber-50/20"
                    : isExpiring
                    ? "border-yellow-300 bg-yellow-50/15"
                    : "border-stone-200"
                }`}
              >
                {/* Dados da Loja e Status */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-stone-900 truncate">
                      {biz.name}
                    </span>

                    {/* Badge de Plano */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        biz.plan_tier === "diamond"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : biz.plan_tier === "pro"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {biz.plan_tier === "diamond"
                        ? "💎 Diamante"
                        : biz.plan_tier === "pro"
                        ? "⭐ Pro"
                        : "Grátis"}
                    </span>

                    {/* Badge de Alerta de Assinatura */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isGrace
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : isExpiring
                          ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                          : biz.sub.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {isGrace && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                      {biz.sub.badgeLabel}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 flex items-center gap-3 flex-wrap">
                    <span>
                      📍 {biz.neighborhood || "DF"} • {biz.city || "Brasília"}
                    </span>
                    {biz.email && (
                      <span className="text-stone-400">
                        ✉️ {biz.email}
                      </span>
                    )}
                    {biz.whatsapp && (
                      <span className="text-stone-700 font-semibold">
                        📱 {formatDisplayPhone(biz.whatsapp)}
                      </span>
                    )}
                  </div>

                  {/* Informações de Vencimento e Prazo de Confiança */}
                  <div className="text-xs text-stone-600 pt-1">
                    {isGrace ? (
                      <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-900 font-medium">
                        🤝 <strong>Prazo de Confiança Ativo:</strong> Venceu em{" "}
                        {biz.sub.featuredUntil?.toLocaleDateString("pt-BR")}. O lojista tem até{" "}
                        <strong>{biz.sub.gracePeriodUntil?.toLocaleDateString("pt-BR")}</strong> ({biz.sub.graceDaysRemaining}d restantes) para renovar sem perder a posição no topo.
                      </div>
                    ) : isExpiring ? (
                      <div className="text-yellow-800 font-medium">
                        ⏰ Vence em <strong>{biz.sub.daysRemaining} {biz.sub.daysRemaining === 1 ? "dia" : "dias"}</strong> ({biz.sub.featuredUntil?.toLocaleDateString("pt-BR")}). Momento ideal para contato preventivo!
                      </div>
                    ) : biz.sub.featuredUntil ? (
                      <span>
                        Vencimento: <strong>{biz.sub.featuredUntil.toLocaleDateString("pt-BR")}</strong> ({biz.sub.daysRemaining} dias restantes)
                      </span>
                    ) : (
                      <span className="text-stone-400">Loja no Plano Grátis (sem destaque)</span>
                    )}
                  </div>
                </div>

                {/* Botões de Ação Imediata de Cobrança / Contato */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* Botão de WhatsApp de Alta Conversão */}
                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                      title="Abre o WhatsApp com mensagem persuasiva e acolhedora pronta"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isGrace ? "Notificar Confiança" : isExpiring ? "Lembrete WhatsApp" : "Chamar WhatsApp"}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-stone-400 italic">Sem WhatsApp</span>
                  )}

                  {/* Botão Copiar Texto da Mensagem */}
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(biz, msgType)}
                    className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="Copiar texto da mensagem persuasiva para a área de transferência"
                  >
                    {copiedId === biz.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-500" />
                    )}
                  </button>

                  {/* Botão de Renovação Rápida Manual (+30 Dias) */}
                  <button
                    type="button"
                    onClick={() => handleQuickRenew(biz, 30)}
                    disabled={updatingId === biz.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    title="Renova o plano manualmente por 30 dias (ex: pagamento em dinheiro/externo)"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>{updatingId === biz.id ? "Salvando..." : "+30 Dias"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
