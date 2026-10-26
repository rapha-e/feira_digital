"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Building2,
  ExternalLink,
  Eye,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  X,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Sponsor } from "@/types";

export function AdminSponsorsTab() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [placement, setPlacement] = useState<"home" | "painel" | "all">("home");
  const [ctaText, setCtaText] = useState("Saiba Mais");
  const [badgeText, setBadgeText] = useState("Parceiro Oficial");
  const [formError, setFormError] = useState("");

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sponsors?admin=1");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSponsors(data);
      }
    } catch {
      // Ignora erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  const openCreateModal = () => {
    setEditingSponsor(null);
    setName("");
    setTitle("");
    setSubtitle("");
    setTargetUrl("");
    setImageUrl("");
    setPlacement("home");
    setCtaText("Saiba Mais");
    setBadgeText("Parceiro Oficial");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (spon: Sponsor) => {
    setEditingSponsor(spon);
    setName(spon.name || "");
    setTitle(spon.title || "");
    setSubtitle(spon.subtitle || "");
    setTargetUrl(spon.target_url || "");
    setImageUrl(spon.image_url || "");
    setPlacement((spon.placement as "home" | "painel" | "all") || "home");
    setCtaText(spon.cta_text || "Saiba Mais");
    setBadgeText(spon.badge_text || "Parceiro Oficial");
    setFormError("");
    setShowModal(true);
  };

  const handleToggle = async (spon: Sponsor) => {
    const newStatus = !spon.is_active;
    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id: spon.id, is_active: newStatus }),
      });
      if (res.ok) {
        setSponsors(prev =>
          prev.map(s => (s.id === spon.id ? { ...s, is_active: newStatus } : s))
        );
      }
    } catch {
      alert("Erro ao alterar status do anúncio.");
    }
  };

  const handleDelete = async (spon: Sponsor) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir permanentemente o anúncio de "${spon.name}"?\nEsta ação não poderá ser revertida.`
    );
    if (!confirmed) return;

    setDeletingId(spon.id);
    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: spon.id }),
      });
      if (res.ok) {
        setSponsors(prev => prev.filter(s => s.id !== spon.id));
      } else {
        alert("Falha ao excluir anúncio.");
      }
    } catch {
      alert("Erro de comunicação ao excluir anúncio.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !title.trim() || !targetUrl.trim()) {
      setFormError("Por favor, preencha o Nome, Título e URL de Destino.");
      return;
    }

    setSaving(true);
    try {
      if (editingSponsor) {
        // Atualização de anúncio existente
        const res = await fetch("/api/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            id: editingSponsor.id,
            data: {
              name: name.trim(),
              title: title.trim(),
              subtitle: subtitle.trim() || null,
              target_url: targetUrl.trim(),
              image_url: imageUrl.trim() || null,
              placement,
              cta_text: ctaText.trim() || "Saiba Mais",
              badge_text: badgeText.trim() || "Parceiro Oficial",
            },
          }),
        });

        if (res.ok) {
          setShowModal(false);
          setEditingSponsor(null);
          loadSponsors();
        } else {
          setFormError("Falha ao atualizar anúncio.");
        }
      } else {
        // Cadastro de novo anúncio
        const res = await fetch("/api/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            title: title.trim(),
            subtitle: subtitle.trim() || null,
            target_url: targetUrl.trim(),
            image_url: imageUrl.trim() || null,
            placement,
            cta_text: ctaText.trim() || "Saiba Mais",
            badge_text: badgeText.trim() || "Parceiro Oficial",
            is_active: true,
          }),
        });

        if (res.ok) {
          setShowModal(false);
          setName("");
          setTitle("");
          setSubtitle("");
          setTargetUrl("");
          setImageUrl("");
          loadSponsors();
        } else {
          setFormError("Falha ao salvar anunciante.");
        }
      }
    } catch {
      setFormError("Erro de comunicação ao salvar anunciante.");
    } finally {
      setSaving(false);
    }
  };


  // KPIs
  const totalViews = sponsors.reduce((acc, s) => acc + (s.views_count || 0), 0);
  const totalClicks = sponsors.reduce((acc, s) => acc + (s.clicks_count || 0), 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";
  const activeCount = sponsors.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Banner de Métricas B2B */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Anunciantes Ativos</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{activeCount}</div>
          <span className="text-[11px] text-stone-400">Total cadastrados: {sponsors.length}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Visualizações</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{totalViews.toLocaleString("pt-BR")}</div>
          <span className="text-[11px] text-stone-400">Impressões em tela</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cliques Gerados</span>
            <MousePointerClick className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{totalClicks.toLocaleString("pt-BR")}</div>
          <span className="text-[11px] text-stone-400">Leads entregues aos parceiros</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa Média (CTR)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{avgCtr}%</div>
          <span className="text-[11px] text-stone-400">Conversão de cliques/views</span>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Gestão de Anunciantes & Banners Patrocinados</span>
          </h2>
          <p className="text-xs text-stone-500">
            Monetize com publicidade B2B direcionada aos clientes da Home ou aos MEIs no Painel.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Anunciante</span>
        </button>
      </div>

      {/* Tabela de Anunciantes */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Carregando anunciantes...</span>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-800">Nenhum anunciante cadastrado ainda</p>
            <p className="text-xs text-stone-500">
              Clique no botão acima para cadastrar seu primeiro parceiro comercial.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Anunciante & Oferta</th>
                  <th className="py-3 px-4">Onde Exibe</th>
                  <th className="py-3 px-4 text-center">Visualizações</th>
                  <th className="py-3 px-4 text-center">Cliques</th>
                  <th className="py-3 px-4 text-center">CTR</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {sponsors.map(spon => {
                  const ctr =
                    spon.views_count && spon.views_count > 0
                      ? (((spon.clicks_count || 0) / spon.views_count) * 100).toFixed(1)
                      : "0";

                  return (
                    <tr key={spon.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {spon.image_url ? (
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-50">
                              <Image
                                src={spon.image_url}
                                alt={spon.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-stone-900 block truncate">
                              {spon.name}
                            </span>
                            <span className="text-[11px] text-stone-500 line-clamp-1">
                              {spon.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700 uppercase">
                          {spon.placement === "home"
                            ? "🏠 Home (Pública)"
                            : spon.placement === "painel"
                            ? "📊 Painel (Lojistas)"
                            : "🌐 Todos os Locais"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-stone-700">
                        {spon.views_count?.toLocaleString("pt-BR") || 0}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        {spon.clicks_count?.toLocaleString("pt-BR") || 0}
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-stone-600">
                        {ctr}%
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggle(spon)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all shadow-2xs ${
                            spon.is_active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                          }`}
                          title={
                            spon.is_active
                              ? "Anúncio Ativo no Ar. Clique para desativar/pausar sem excluir."
                              : "Anúncio Pausado. Clique para ativar novamente."
                          }
                        >
                          {spon.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Ativo no Ar</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-stone-400" />
                              <span>Pausado</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(spon)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                            title="Editar este anúncio"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(spon)}
                            disabled={deletingId === spon.id}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                            title="Excluir este anúncio permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={spon.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Testar link de destino"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro e Edição de Anunciante */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header fixo */}
            <div className="flex items-center justify-between border-b border-stone-100 p-5 shrink-0 bg-white">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>{editingSponsor ? "Editar Anunciante B2B" : "Cadastrar Novo Anunciante B2B"}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com corpo scrollável */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto p-5 space-y-3.5 flex-1 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nome da Empresa / Anunciante *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Atacadão das Embalagens DF"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Título da Oferta / Chamada Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Embalagens delivery e sacolas kraft com 15% OFF"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Subtítulo / Descrição
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="Ex: Entrega expressa em 24h para todo o Distrito Federal"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Link de Destino (WhatsApp ou Site do Anunciante) *
                  </label>
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    placeholder="https://wa.me/5561999990001?text=..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Onde Exibir o Banner
                    </label>
                    <select
                      value={placement}
                      onChange={e => setPlacement(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="home">Home (Página Inicial)</option>
                      <option value="painel">Painel do Lojista (/painel)</option>
                      <option value="all">Em Ambos (Home e Painel)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Texto do Botão (CTA)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={e => setCtaText(e.target.value)}
                      placeholder="Ex: Falar no WhatsApp"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Texto do Selo / Badge
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={e => setBadgeText(e.target.value)}
                      placeholder="Ex: Parceiro Oficial"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      URL da Imagem / Logo (Opcional)
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                    />
                  </div>
                </div>
              </div>

              {/* Rodapé fixo */}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-stone-100 bg-stone-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {saving
                    ? "Salvando..."
                    : editingSponsor
                    ? "Salvar Modificações"
                    : "Cadastrar Anunciante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

