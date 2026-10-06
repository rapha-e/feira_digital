"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  adminLoadData,
  adminUpdateBusiness,
  adminDeleteBusiness,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/app/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { BusinessWithProducts, Category, Product } from "@/types";
import { formatDisplayPhone } from "@/lib/whatsapp";
import {
  ShieldCheck,
  Lock,
  LogOut,
  Store,
  Package,
  Eye,
  MessageCircle,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Phone,
  Sparkles,
  Share2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Sliders,
  FolderTree,
  Server,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const ADMIN_DEFAULT_EMAIL = "admin@feiradigital.com";
const ADMIN_DEFAULT_PASSWORD = "admin123";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "businesses" | "products" | "categories" | "invites" | "system"
  >("overview");

  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessWithProducts[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Formulário de Nova Categoria
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");

  // Gerador de Convite
  const [inviteBizName, setInviteBizName] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Estados para Edição de Empreendimento / Negócio
  const [editingBiz, setEditingBiz] = useState<BusinessWithProducts | null>(null);
  const [editBizName, setEditBizName] = useState("");
  const [editBizSlug, setEditBizSlug] = useState("");
  const [editBizWhatsapp, setEditBizWhatsapp] = useState("");
  const [editBizCategoryId, setEditBizCategoryId] = useState("");
  const [editBizNeighborhood, setEditBizNeighborhood] = useState("");
  const [editBizCity, setEditBizCity] = useState("Brasília");
  const [editBizBio, setEditBizBio] = useState("");
  const [editBizLimit, setEditBizLimit] = useState(5);
  const [editBizIsOpen, setEditBizIsOpen] = useState(true);
  const [editBizFreeDelivery, setEditBizFreeDelivery] = useState(false);
  const [editBizStorePickup, setEditBizStorePickup] = useState(true);
  const [editBizAcceptsPix, setEditBizAcceptsPix] = useState(true);
  const [editBizAcceptsCard, setEditBizAcceptsCard] = useState(false);
  const [savingBiz, setSavingBiz] = useState(false);

  // Estados para Edição de Categoria
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatSlug, setEditCatSlug] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Estados para Edição de Produto
  const [editingProduct, setEditingProduct] = useState<(Product & { businessName?: string }) | null>(null);
  const [editProdTitle, setEditProdTitle] = useState("");
  const [editProdPrice, setEditProdPrice] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Verifica se já estava autenticado na sessão
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("feira_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      loadAllData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (
      (adminEmail.trim().toLowerCase() === ADMIN_DEFAULT_EMAIL ||
        adminEmail.trim().toLowerCase() === "admin") &&
      adminPassword === ADMIN_DEFAULT_PASSWORD
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem("feira_admin_auth", "true");
      loadAllData();
    } else {
      setLoginError("Credenciais inválidas. Verifique os dados de acesso de administrador.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("feira_admin_auth");
    setIsAuthenticated(false);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const data = await adminLoadData();
      setBusinesses(data.businesses);
      setCategories(data.categories);
    } catch {
      setNotification({ type: "error", text: "Erro ao carregar dados do sistema." });
    } finally {
      setLoading(false);
    }
  };

  // Alterar Status Operacional de um MEI pelo Admin
  const handleToggleBusinessStatus = async (biz: BusinessWithProducts) => {
    const newStatus = !biz.is_open;
    const ok = await adminUpdateBusiness(biz.id, { is_open: newStatus });
    if (ok) {
      setBusinesses(prev =>
        prev.map(b => (b.id === biz.id ? { ...b, is_open: newStatus } : b))
      );
      setNotification({
        type: "success",
        text: `Loja "${biz.name}" agora está ${newStatus ? "ABERTA" : "FECHADA"}.`,
      });
    }
  };

  // Ajustar Teto de Produtos de um MEI
  const handleChangeProductLimit = async (biz: BusinessWithProducts, newLimit: number) => {
    const ok = await adminUpdateBusiness(biz.id, { product_limit: newLimit });
    if (ok) {
      setBusinesses(prev =>
        prev.map(b => (b.id === biz.id ? { ...b, product_limit: newLimit } : b))
      );
      setNotification({
        type: "success",
        text: `Teto de produtos de "${biz.name}" alterado para ${newLimit} itens.`,
      });
    }
  };

  // Excluir Empreendimento
  const handleDeleteBusiness = async (bizId: string, bizName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o negócio "${bizName}" da plataforma?`)) {
      return;
    }

    const ok = await adminDeleteBusiness(bizId);
    if (ok) {
      setBusinesses(prev => prev.filter(b => b.id !== bizId));
      setNotification({
        type: "success",
        text: `Negócio "${bizName}" removido com sucesso.`,
      });
    }
  };

  // --- GESTÃO DE EDIÇÃO DE NEGÓCIO PELO ADMIN ---
  const openEditBusiness = (biz: BusinessWithProducts) => {
    setEditingBiz(biz);
    setEditBizName(biz.name);
    setEditBizSlug(biz.slug);
    setEditBizWhatsapp(biz.whatsapp);
    setEditBizCategoryId(biz.category_id || "");
    setEditBizNeighborhood(biz.neighborhood);
    setEditBizCity(biz.city);
    setEditBizBio(biz.bio || "");
    setEditBizLimit(biz.product_limit || 5);
    setEditBizIsOpen(biz.is_open !== false);
    setEditBizFreeDelivery(biz.free_delivery || false);
    setEditBizStorePickup(biz.store_pickup ?? true);
    setEditBizAcceptsPix(biz.accepts_pix ?? true);
    setEditBizAcceptsCard(biz.accepts_card || false);
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz) return;
    setSavingBiz(true);

    try {
      const updates = {
        name: editBizName.trim(),
        slug: editBizSlug.trim().toLowerCase(),
        whatsapp: editBizWhatsapp.replace(/\D/g, ""),
        category_id: editBizCategoryId || null,
        neighborhood: editBizNeighborhood.trim(),
        city: editBizCity.trim(),
        bio: editBizBio.trim() || null,
        product_limit: Number(editBizLimit),
        is_open: editBizIsOpen,
        free_delivery: editBizFreeDelivery,
        store_pickup: editBizStorePickup,
        accepts_pix: editBizAcceptsPix,
        accepts_card: editBizAcceptsCard,
      };

      const ok = await adminUpdateBusiness(editingBiz.id, updates);
      if (ok) {
        const matchingCategory = categories.find(c => c.id === editBizCategoryId);
        setBusinesses(prev =>
          prev.map(b =>
            b.id === editingBiz.id
              ? {
                  ...b,
                  ...updates,
                  category: matchingCategory || b.category,
                }
              : b
          )
        );
        setNotification({
          type: "success",
          text: `Dados do negócio "${editBizName}" atualizados com sucesso!`,
        });
        setEditingBiz(null);
      } else {
        setNotification({
          type: "error",
          text: "Erro ao atualizar os dados do negócio.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        text: "Ocorreu um erro ao salvar as alterações do negócio.",
      });
    } finally {
      setSavingBiz(false);
    }
  };

  // --- GESTÃO DE EDIÇÃO DE CATEGORIA ---
  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatSlug(cat.slug);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editCatName.trim()) return;

    setSavingCategory(true);
    try {
      const slug =
        editCatSlug.trim() ||
        editCatName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const ok = await adminUpdateCategory(editingCategory.id, {
        name: editCatName.trim(),
        slug,
      });

      if (ok) {
        const updatedCat: Category = {
          ...editingCategory,
          name: editCatName.trim(),
          slug,
        };
        setCategories(prev =>
          prev.map(c => (c.id === editingCategory.id ? updatedCat : c))
        );
        setBusinesses(prev =>
          prev.map(b =>
            b.category_id === editingCategory.id
              ? { ...b, category: updatedCat }
              : b
          )
        );
        setNotification({
          type: "success",
          text: `Categoria "${updatedCat.name}" atualizada com sucesso!`,
        });
        setEditingCategory(null);
      } else {
        setNotification({
          type: "error",
          text: "Não foi possível atualizar a categoria.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        text: "Erro inesperado ao salvar categoria.",
      });
    } finally {
      setSavingCategory(false);
    }
  };

  // --- GESTÃO DE PRODUTO PELO ADMIN (MODERAÇÃO & EDIÇÃO) ---
  const openEditProduct = (prod: Product & { businessName?: string }) => {
    setEditingProduct(prod);
    setEditProdTitle(prod.title);
    setEditProdPrice(prod.price.toString());
    setEditProdDesc(prod.description || "");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editProdPrice.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      setNotification({ type: "error", text: "Informe um preço válido para o produto." });
      return;
    }

    setSavingProduct(true);
    try {
      const ok = await adminUpdateProduct(editingProduct.id, {
        title: editProdTitle.trim(),
        price: priceNum,
        description: editProdDesc.trim() || null,
      });

      if (ok) {
        setBusinesses(prev =>
          prev.map(b => ({
            ...b,
            products: (b.products || []).map(p =>
              p.id === editingProduct.id
                ? {
                    ...p,
                    title: editProdTitle.trim(),
                    price: priceNum,
                    description: editProdDesc.trim() || null,
                  }
                : p
            ),
          }))
        );
        setNotification({
          type: "success",
          text: `Produto "${editProdTitle.trim()}" atualizado com sucesso!`,
        });
        setEditingProduct(null);
      } else {
        setNotification({
          type: "error",
          text: "Falha ao salvar modificações no produto.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        text: "Erro ao atualizar produto.",
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (prodId: string, prodTitle: string) => {
    if (!confirm(`Tem certeza que deseja remover o produto "${prodTitle}"?`)) return;

    const ok = await adminDeleteProduct(prodId);
    if (ok) {
      setBusinesses(prev =>
        prev.map(b => ({
          ...b,
          products: (b.products || []).filter(p => p.id !== prodId),
        }))
      );
      setNotification({
        type: "success",
        text: `Produto "${prodTitle}" removido do catálogo.`,
      });
    } else {
      setNotification({
        type: "error",
        text: "Erro ao remover produto.",
      });
    }
  };

  // Criar Categoria
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug =
      newCatSlug.trim() ||
      newCatName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newCat = await adminCreateCategory(newCatName.trim(), slug);
    if (newCat) {
      setCategories(prev => [...prev, newCat]);
      setNewCatName("");
      setNewCatSlug("");
      setNotification({ type: "success", text: "Nova categoria adicionada!" });
    }
  };

  // Excluir Categoria
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Remover categoria "${catName}"?`)) return;
    const ok = await adminDeleteCategory(catId);
    if (ok) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      setNotification({ type: "success", text: "Categoria removida." });
    }
  };

  // Gerar Convite Mágico
  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteBizName.trim()) return;

    const slug = inviteBizName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const origin = typeof window !== "undefined" ? window.location.origin : "https://feiradigital.local";
    const link = `${origin}/convite/${slug}`;
    setGeneratedInviteLink(link);
  };

  const copyInviteToClipboard = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  // Métricas Consolidadas
  const totalBusinesses = businesses.length;
  const totalOpen = businesses.filter(b => b.is_open !== false).length;
  const totalProducts = businesses.reduce((acc, b) => acc + (b.products?.length || 0), 0);
  const totalViews = businesses.reduce((acc, b) => acc + (b.views_count || 0), 0);
  const totalClicks = businesses.reduce((acc, b) => acc + (b.whatsapp_clicks_count || 0), 0);
  const avgConversion = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  // Filtro de Negócios
  const filteredBusinesses = businesses.filter(b => {
    const matchesQuery =
      searchQuery === "" ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === "" || b.category_id === categoryFilter || b.category?.slug === categoryFilter;
    return matchesQuery && matchesCat;
  });

  // Todos os Produtos Planificados
  const allProducts = businesses.flatMap(b =>
    (b.products || []).map(p => ({ ...p, businessName: b.name, businessSlug: b.slug }))
  );

  // --- TELA DE LOGIN DE ADMINISTRADOR ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center px-4 py-8 text-stone-100">
        <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Painel de Administração
            </h1>
            <p className="text-xs text-stone-400">
              Acesso restrito para gestão global da Feira Digital
            </p>
          </div>

          {/* Dica amigável de credencial */}
          <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800 text-xs text-stone-300 space-y-1">
            <span className="font-bold text-emerald-400 block">Credenciais Padrão do Sistema:</span>
            <div className="font-mono text-[11px] text-stone-400">
              E-mail: <strong className="text-stone-200">{ADMIN_DEFAULT_EMAIL}</strong>
            </div>
            <div className="font-mono text-[11px] text-stone-400">
              Senha: <strong className="text-stone-200">{ADMIN_DEFAULT_PASSWORD}</strong>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                E-mail ou Usuário Master
              </label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@feiradigital.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-800 bg-stone-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-800 bg-stone-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              Autenticar como Administrador
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-800">
            <Link
              href="/"
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Voltar para a Vitrine Pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- ÁREA RESTRITA DO ADMINISTRADOR ---
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pb-16 text-stone-900">
      {/* Top Navbar do Admin */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block leading-tight">
                Feira<span className="text-emerald-400">Admin</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Painel Central de Controle
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
            >
              <span>Ver Vitrine</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Menu de Abas de Navegação */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-stone-800/80 pt-1 pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            📊 Visão Geral
          </button>

          <button
            onClick={() => setActiveTab("businesses")}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "businesses"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            🏪 Empreendedores ({businesses.length})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "products"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            📦 Catálogo ({allProducts.length})
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "categories"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            🏷️ Categorias ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab("invites")}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "invites"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            🪄 Convites Mágicos
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "system"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            ⚙️ Diagnóstico
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Notificações */}
        {notification && (
          <div
            className={`p-3.5 rounded-2xl text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ================= ABA 1: VISÃO GERAL & KPIS ================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Total de Lojas
                </span>
                <span className="text-2xl font-black text-stone-900 mt-1 block">
                  {totalBusinesses}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  {totalOpen} abertas agora
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Total Produtos
                </span>
                <span className="text-2xl font-black text-stone-900 mt-1 block">
                  {totalProducts}
                </span>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Em todas as lojas
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Visualizações
                </span>
                <span className="text-2xl font-black text-stone-900 mt-1 block">
                  {totalViews}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                  Páginas de vitrine
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Cliques WhatsApp
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {totalClicks}
                </span>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Leads gerados
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Taxa Conversão
                </span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {avgConversion}%
                </span>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Cliques / Visitas
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Categorias
                </span>
                <span className="text-2xl font-black text-stone-900 mt-1 block">
                  {categories.length}
                </span>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Segmentos ativos
                </span>
              </div>
            </div>

            {/* Ações Rápidas do Administrador */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <span>Atalhos de Operação do Administrador</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab("businesses")}
                  className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition-colors cursor-pointer"
                >
                  <Store className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="font-bold text-sm text-stone-900 block">
                    Gerenciar Lojistas & Tetos
                  </span>
                  <span className="text-xs text-stone-500">
                    Ajustar limites de catálogo e moderar vitrines cadastradas.
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("invites")}
                  className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition-colors cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
                  <span className="font-bold text-sm text-stone-900 block">
                    Criar Convites Mágicos
                  </span>
                  <span className="text-xs text-stone-500">
                    Gerar link de onboarding e convidar novo lojista via WhatsApp.
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("categories")}
                  className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition-colors cursor-pointer"
                >
                  <FolderTree className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="font-bold text-sm text-stone-900 block">
                    Adicionar Novas Categorias
                  </span>
                  <span className="text-xs text-stone-500">
                    Expandir os ramos de negócio suportados na plataforma.
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 2: GESTÃO DE EMPREENDEDORES (MEIS) ================= */}
        {activeTab === "businesses" && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Empreendedores Cadastrados ({filteredBusinesses.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Controle status operacional, ajuste de limite de produtos e ações de moderação.
                </p>
              </div>

              {/* Barra de Filtro */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome ou bairro..."
                    className="pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabela de Lojistas */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Loja / Empreendedor</th>
                    <th className="py-3 px-3">Localização & Categoria</th>
                    <th className="py-3 px-3">WhatsApp</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Teto de Produtos</th>
                    <th className="py-3 px-3">Visualizações / Leads</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredBusinesses.map(biz => {
                    const isOpen = biz.is_open !== false;
                    const limit = biz.product_limit || 5;

                    return (
                      <tr key={biz.id} className="hover:bg-stone-50/60 transition-colors">
                        {/* Loja */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                              {biz.avatar_url ? (
                                <Image
                                  src={biz.avatar_url}
                                  alt={biz.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                  <Store className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block truncate max-w-[150px]">
                                {biz.name}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                /{biz.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Localização & Categoria */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-stone-700 block">
                            {biz.neighborhood}, {biz.city}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold inline-block">
                            {biz.category?.name || "Sem categoria"}
                          </span>
                        </td>

                        {/* WhatsApp */}
                        <td className="py-3 px-3">
                          <a
                            href={`https://wa.me/${biz.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-700 hover:text-emerald-600 font-mono inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{formatDisplayPhone(biz.whatsapp)}</span>
                          </a>
                        </td>

                        {/* Status Operacional */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleBusinessStatus(biz)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              isOpen
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                            }`}
                            title="Clique para alternar o status operacional desta loja"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOpen ? "bg-green-500 animate-pulse" : "bg-stone-400"
                              }`}
                            />
                            <span>{isOpen ? "Aberto" : "Fechado"}</span>
                          </button>
                        </td>

                        {/* Teto de Produtos (Flexibilização) */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-stone-700">
                              {biz.products?.length || 0}/
                            </span>
                            <select
                              value={limit}
                              onChange={e =>
                                handleChangeProductLimit(biz, parseInt(e.target.value, 10))
                              }
                              className="py-0.5 px-1.5 rounded border border-stone-200 bg-white text-[11px] font-bold text-stone-800"
                            >
                              <option value="5">5 itens (Grátis)</option>
                              <option value="10">10 itens (Pro)</option>
                              <option value="20">20 itens (Plus)</option>
                              <option value="50">50 itens (Ilimitado)</option>
                            </select>
                          </div>
                        </td>

                        {/* Métricas */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5 text-[11px]">
                            <span className="text-stone-600 block">
                              👁️ {biz.views_count || 0} views
                            </span>
                            <span className="text-emerald-700 font-semibold block">
                              💬 {biz.whatsapp_clicks_count || 0} cliques
                            </span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditBusiness(biz)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-colors"
                              title="Editar dados da loja"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/${biz.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                              title="Abrir vitrine da loja"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteBusiness(biz.id, biz.name)}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              title="Remover negócio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ABA 3: CATÁLOGO GERAL DE PRODUTOS ================= */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Catálogo Global ({allProducts.length} itens cadastrados)
              </h2>
              <p className="text-xs text-stone-500">
                Todos os produtos e serviços publicados pelos lojistas na Feira Digital.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allProducts.map(prod => (
                <div
                  key={prod.id}
                  className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full bg-stone-100">
                    {prod.image_url ? (
                      <Image
                        src={prod.image_url}
                        alt={prod.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-stone-400 block truncate flex-1">
                        {prod.businessName}
                      </span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="p-1 rounded-md text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-colors"
                          title="Editar produto"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.title)}
                          className="p-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1" title={prod.title}>
                      {prod.title}
                    </h4>
                    <span className="text-xs font-black text-emerald-600 block">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(prod.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ABA 4: GESTÃO DE CATEGORIAS ================= */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Formulário Nova Categoria */}
            <div className="md:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Adicionar Nova Categoria</span>
              </h3>

              <form onSubmit={handleCreateCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Ex: Papelaria & Livros"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Slug da URL (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={e => setNewCatSlug(e.target.value)}
                    placeholder="papelaria-livros (gerado automaticamente se vazio)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  Cadastrar Categoria
                </button>
              </form>
            </div>

            {/* Lista de Categorias */}
            <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900">
                Categorias no Sistema ({categories.length})
              </h3>

              <div className="divide-y divide-stone-100">
                {categories.map(cat => {
                  const businessesInCat = businesses.filter(
                    b => b.category_id === cat.id || b.category?.slug === cat.slug
                  ).length;

                  return (
                    <div
                      key={cat.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block">{cat.name}</span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          /{cat.slug} • {businessesInCat} lojistas
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditCategory(cat)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                          title="Editar categoria"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          title="Excluir categoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 5: CENTRAL DE CONVITES MÁGICOS ================= */}
        {activeTab === "invites" && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6 fill-stone-950" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Gerador de Convites Mágicos para Lojistas
              </h2>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Crie um link exclusivo com o nome do microempreendedor pré-preenchido e envie diretamente para o WhatsApp dele para acelerar a entrada na plataforma.
              </p>
            </div>

            <form onSubmit={handleGenerateInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Negócio a ser Convidado *
                </label>
                <input
                  type="text"
                  required
                  value={inviteBizName}
                  onChange={e => setInviteBizName(e.target.value)}
                  placeholder="Ex: Pastelaria do Beto"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Gerar Link Mágico de Convite
              </button>
            </form>

            {generatedInviteLink && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-800 block">
                  Link Mágico Gerado:
                </span>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 font-mono text-xs text-stone-700 break-all select-all">
                  {generatedInviteLink}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={copyInviteToClipboard}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedInvite ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedInvite ? "Link Copiado!" : "Copiar Link de Convite"}</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Olá! Criamos uma vitrine gratuita e exclusiva para você na Feira Digital. Clique aqui para ativar em menos de 1 minuto e receber pedidos pelo WhatsApp: ${generatedInviteLink}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Enviar no WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 6: DIAGNÓSTICO DO SISTEMA ================= */}
        {activeTab === "system" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <span>Diagnóstico & Configurações da Infraestrutura</span>
              </h2>
              <p className="text-xs text-stone-500">
                Informações de execução, banco de dados e ambiente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  Conexão Supabase
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSupabaseConfigured() ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs font-semibold text-stone-900">
                    {isSupabaseConfigured()
                      ? "Conectado ao Supabase (PostgreSQL & Storage Ativos)"
                      : "Modo Demonstração Interativa (Dados Locais em Memória)"}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {isSupabaseConfigured()
                    ? "As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão carregadas."
                    : "Para sincronizar com nuvem real, configure o arquivo .env.local e execute o script supabase/schema.sql."}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  Segurança & Credencial Master
                </span>
                <div className="text-xs text-stone-600 space-y-1 font-mono text-[11px]">
                  <div>Usuário: {ADMIN_DEFAULT_EMAIL}</div>
                  <div>Senha: {ADMIN_DEFAULT_PASSWORD}</div>
                  <div className="text-stone-400">Autenticação: Session Storage Segura</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDITAR LOJA / EMPREENDEDOR ================= */}
        {editingBiz && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-600" />
                    <span>Editar Empreendimento</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Atualize os dados e parâmetros operacionais de {editingBiz.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBiz(null)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBusiness} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      required
                      value={editBizName}
                      onChange={e => setEditBizName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Slug da Vitrine *
                    </label>
                    <div className="flex rounded-xl border border-stone-200 bg-stone-50 overflow-hidden">
                      <span className="px-3 py-2.5 text-xs text-stone-400 select-none">/</span>
                      <input
                        type="text"
                        required
                        value={editBizSlug}
                        onChange={e => setEditBizSlug(e.target.value)}
                        className="w-full px-2 py-2.5 bg-white text-xs sm:text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp (apenas números) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editBizWhatsapp}
                      onChange={e => setEditBizWhatsapp(e.target.value)}
                      placeholder="61999999999"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={editBizCategoryId}
                      onChange={e => setEditBizCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      value={editBizNeighborhood}
                      onChange={e => setEditBizNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={editBizCity}
                      onChange={e => setEditBizCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Bio / Apresentação
                  </label>
                  <textarea
                    rows={2}
                    value={editBizBio}
                    onChange={e => setEditBizBio(e.target.value)}
                    placeholder="Descrição curta do negócio..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Parâmetros Operacionais */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-stone-800 block">
                    Parâmetros Operacionais & Teto
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-600 mb-1 font-medium">
                        Teto de Produtos no Catálogo:
                      </label>
                      <select
                        value={editBizLimit}
                        onChange={e => setEditBizLimit(Number(e.target.value))}
                        className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-white text-xs font-bold"
                      >
                        <option value="5">5 itens (Plano Grátis)</option>
                        <option value="10">10 itens (Plano Pro)</option>
                        <option value="20">20 itens (Plano Plus)</option>
                        <option value="50">50 itens (Ilimitado)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editBizIsOpen}
                          onChange={e => setEditBizIsOpen(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Vitrine Aberta para Atendimento</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200">
                    <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBizFreeDelivery}
                        onChange={e => setEditBizFreeDelivery(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Frete Grátis</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBizStorePickup}
                        onChange={e => setEditBizStorePickup(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Retirada</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBizAcceptsPix}
                        onChange={e => setEditBizAcceptsPix(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Aceita Pix</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBizAcceptsCard}
                        onChange={e => setEditBizAcceptsCard(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Aceita Cartão</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBiz(null)}
                    className="py-2.5 px-4 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingBiz}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {savingBiz ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDITAR CATEGORIA ================= */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-blue-600" />
                  <span>Editar Categoria</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCatName}
                    onChange={e => setEditCatName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Slug da URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCatSlug}
                    onChange={e => setEditCatSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="py-2.5 px-4 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {savingCategory ? "Salvando..." : "Salvar Categoria"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDITAR PRODUTO (MODERAÇÃO) ================= */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <span>Editar Produto</span>
                  </h3>
                  {editingProduct.businessName && (
                    <span className="text-[11px] text-stone-400">
                      Loja: {editingProduct.businessName}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Título do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProdTitle}
                    onChange={e => setEditProdTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProdPrice}
                    onChange={e => setEditProdPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Descrição do Produto
                  </label>
                  <textarea
                    rows={3}
                    value={editProdDesc}
                    onChange={e => setEditProdDesc(e.target.value)}
                    placeholder="Detalhes ou especificações..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="py-2.5 px-4 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {savingProduct ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
