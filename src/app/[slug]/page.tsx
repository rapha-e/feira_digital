import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FormattedBio } from "@/components/FormattedBio";
import { InstagramIcon } from "@/components/InstagramIcon";
import { getBusinessBySlug, recordStoreView } from "@/lib/data";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  MapPin,
  ArrowLeft,
  Store,
  Package,
  Truck,
  ShoppingBag,
  QrCode,
  CreditCard,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BusinessProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BusinessProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return {
      title: "Negócio não encontrado - Feira Digital",
    };
  }

  return {
    title: `${business.name} | Feira Digital`,
    description:
      business.bio ||
      `Conheça ${business.name} em ${business.neighborhood}, ${business.city}.`,
  };
}

export default async function BusinessProfilePage({
  params,
}: BusinessProfilePageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  // Registra visualização de página da vitrine (Pilar 3)
  recordStoreView(business.id).catch(() => {});

  const isOpen = business.is_open !== false;
  const mainWhatsAppUrl = buildWhatsAppLink(business.whatsapp, business.name);
  const productLimit = business.product_limit || 20;

  // Detecção inteligente do Instagram oficial da loja
  const rawInstagram =
    business.instagram ||
    (business.slug.includes(".") ? business.slug : null) ||
    business.bio?.match(/@([a-zA-Z0-9_.]+)/)?.[1] ||
    (business.slug === "femmijoias.oficial" ? "femmijoias.oficial" : null);

  const instagramHandle = rawInstagram
    ? rawInstagram.replace(/^@/, "").replace(/\/$/, "")
    : null;

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col pb-28 md:pb-16 text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Barra Superior de Navegação */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-stone-200/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para todas as vitrines</span>
          </Link>

          {business.is_featured && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/70">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Vitrine Patrocinada Oficial</span>
            </span>
          )}
        </div>

        {/* ================= HERO CARD BOUTIQUE PREMIUM ================= */}
        <section
          className={`relative bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${
            business.is_featured
              ? "border-amber-300/80 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/30"
              : "border-stone-200/80 shadow-xs"
          }`}
        >
          {/* Capa Decorativa Superior (Aura de Loja de Luxo) */}
          <div
            className={`h-24 sm:h-32 w-full relative overflow-hidden ${
              business.is_featured
                ? "bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950"
                : "bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900"
            }`}
          >
            {/* Efeito luminoso e micro-textura no banner */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_50%)]" />

            {/* Selo Dourado em Destaque no Topo do Banner */}
            {business.is_featured && (
              <div className="absolute top-3.5 right-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-stone-950 shadow-md border border-amber-300/80">
                  <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                  <span>⭐ DESTAQUE EXCLUSIVO</span>
                </span>
              </div>
            )}
          </div>

          {/* Conteúdo Principal do Perfil da Loja */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 sm:-mt-14">
              {/* Bloco Esquerda: Avatar + Informações Centrais */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5 min-w-0">
                {/* Avatar da Loja com Ring Protetor */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xl ${
                    business.is_featured
                      ? "ring-4 ring-amber-300/90 border-2 border-white"
                      : "ring-4 ring-white border border-stone-200"
                  }`}
                >
                  {business.avatar_url ? (
                    <Image
                      src={business.avatar_url}
                      alt={business.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 640px) 80px, 96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                      <Store className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Título & Badges de Confiança */}
                <div className="space-y-1.5 min-w-0 pt-1">
                  {/* Badges de Selo e Categoria */}
                  <div className="flex flex-wrap items-center gap-2">
                    {business.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>MEI Verificado</span>
                      </span>
                    )}

                    {business.category && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200/80">
                        {business.category.name}
                      </span>
                    )}

                    {isOpen ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Atendimento Aberto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                        <span className="w-2 h-2 rounded-full bg-stone-400" />
                        Fechado no momento
                      </span>
                    )}
                  </div>

                  {/* Nome da Loja */}
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                    {business.name}
                  </h1>

                  {/* Localização e Instagram */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-500 pt-0.5">
                    <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>
                        {business.neighborhood}, {business.city}
                      </span>
                    </span>

                    {/* Badge Oficial do Instagram (@) */}
                    {instagramHandle && (
                      <a
                        href={`https://instagram.com/${instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-pink-700 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-200 transition-all hover:scale-105 active:scale-95 shadow-2xs group"
                        title={`Visitar perfil @${instagramHandle} no Instagram`}
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-600 group-hover:rotate-6 transition-transform" />
                        <span>@{instagramHandle}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Bloco Direita: Botão de Conversão Principal no Desktop */}
              <div className="shrink-0 hidden md:block">
                <WhatsAppButton
                  href={mainWhatsAppUrl}
                  businessId={business.id}
                  businessName={business.name}
                  label="Falar no WhatsApp"
                  className="shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
                />
              </div>
            </div>

            {/* Divisor Delicado */}
            <hr className="my-5 border-stone-100" />

            {/* Bio da Loja Formatada (Com links de sites e @ Instagram clicáveis) */}
            {business.bio && (
              <div className="bg-stone-50/70 rounded-2xl p-4 sm:p-5 border border-stone-200/60 text-stone-700 text-xs sm:text-sm leading-relaxed max-w-3xl">
                <FormattedBio bio={business.bio} />
              </div>
            )}

            {/* Pills de Facilidades e Parâmetros Operacionais (Design Boutique) */}
            <div className="pt-4 flex flex-wrap items-center gap-2">
              {business.free_delivery && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50/80 text-emerald-900 border border-emerald-200/70 shadow-2xs">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Entrega Grátis na Região</span>
                </div>
              )}

              {business.store_pickup && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-50 text-stone-800 border border-stone-200 shadow-2xs">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Retirada no Local</span>
                </div>
              )}

              {business.accepts_pix && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50/80 text-teal-900 border border-teal-200/70 shadow-2xs">
                  <QrCode className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Aceita Pix</span>
                </div>
              )}

              {business.accepts_card && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50/80 text-indigo-900 border border-indigo-200/70 shadow-2xs">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Aceita Cartão</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-stone-50 text-stone-600 border border-stone-200/60 ml-auto hidden sm:inline-flex">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Compra Direta sem Intermediários</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CATÁLOGO DE PRODUTOS & SERVIÇOS ================= */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight">
                  Catálogo de Produtos & Serviços
                </h2>
                <p className="text-xs text-stone-500">
                  Selecione um item para pedir diretamente pelo WhatsApp da loja
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {business.products?.length || 0} de {productLimit} itens
            </span>
          </div>

          <ProductGrid
            products={business.products || []}
            businessName={business.name}
            businessWhatsApp={business.whatsapp}
            businessId={business.id}
            storeSlug={business.slug}
          />
        </section>
      </main>

      {/* Botão Flutuante de Conversão no Mobile (Sticky Bottom) */}
      <WhatsAppButton
        href={mainWhatsAppUrl}
        businessId={business.id}
        businessName={business.name}
        label="Falar no WhatsApp"
        variant="floating"
      />
    </div>
  );
}
