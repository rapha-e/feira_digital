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

  // Registra visualização de página da vitrine
  recordStoreView(business.id).catch(() => {});

  const isOpen = business.is_open !== false;
  const mainWhatsAppUrl = buildWhatsAppLink(business.whatsapp, business.name);
  const productLimit = business.product_limit || 20;

  // Detecção inteligente do Instagram
  const rawInstagram =
    business.instagram ||
    (business.slug.includes(".") ? business.slug : null) ||
    business.bio?.match(/@([a-zA-Z0-9_.]+)/)?.[1] ||
    (business.slug === "femmijoias.oficial" ? "femmijoias.oficial" : null);

  const instagramHandle = rawInstagram
    ? rawInstagram.replace(/^@/, "").replace(/\/$/, "")
    : null;

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col pb-28 md:pb-16 text-stone-900">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* Barra Superior com Link de Retorno */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para todas as vitrines</span>
          </Link>
        </div>

        {/* ================= HERO CARD LIMPO & EQUILIBRADO ================= */}
        <section
          className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all duration-200 ${
            business.is_featured
              ? "border-amber-300 shadow-md ring-1 ring-amber-300/40"
              : "border-stone-200 shadow-xs"
          }`}
        >
          {/* Linha Superior de Badges & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-1.5">
              {business.is_featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>DESTAQUE EXCLUSIVO</span>
                </span>
              )}

              {business.is_verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <BadgeCheck className="w-3 h-3 text-blue-600" />
                  <span>MEI Verificado</span>
                </span>
              )}

              {business.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200/80">
                  {business.category.name}
                </span>
              )}

              {isOpen ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Atendimento Aberto
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                  Fechado
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compra Direta</span>
            </div>
          </div>

          {/* Área Central: Avatar + Identidade da Loja + Botão WhatsApp Alinhado */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar da Loja */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shadow-xs">
                {business.avatar_url ? (
                  <Image
                    src={business.avatar_url}
                    alt={business.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                    <Store className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Informações da Loja */}
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {business.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1 text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>
                      {business.neighborhood}, {business.city}
                    </span>
                  </span>

                  {/* Instagram oficial clicável */}
                  {instagramHandle && (
                    <a
                      href={`https://instagram.com/${instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                      title={`Abrir @${instagramHandle} no Instagram`}
                    >
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span>@{instagramHandle}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-pink-400 opacity-80" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Botão de WhatsApp Integrado ao Topo (Harmônico e Alinhado) */}
            <div className="shrink-0 hidden md:block">
              <WhatsAppButton
                href={mainWhatsAppUrl}
                businessId={business.id}
                businessName={business.name}
                label="Falar no WhatsApp"
              />
            </div>
          </div>

          {/* Bio da Loja Formatada com links azuis e fontes reduzidas */}
          {business.bio && (
            <div className="mt-4 bg-stone-50/80 rounded-xl p-3.5 sm:p-4 border border-stone-100 text-stone-600 text-xs sm:text-xs leading-relaxed max-w-3xl">
              <FormattedBio bio={business.bio} />
            </div>
          )}

          {/* Pills de Facilidades Operacionais */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
            {business.free_delivery && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-50 text-stone-700 border border-stone-200/70">
                <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Entrega Grátis</span>
              </span>
            )}

            {business.store_pickup && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-50 text-stone-700 border border-stone-200/70">
                <ShoppingBag className="w-3 h-3 text-stone-500 shrink-0" />
                <span>Retirada no Local</span>
              </span>
            )}

            {business.accepts_pix && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-50 text-stone-700 border border-stone-200/70">
                <QrCode className="w-3 h-3 text-teal-600 shrink-0" />
                <span>Aceita Pix</span>
              </span>
            )}

            {business.accepts_card && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-50 text-stone-700 border border-stone-200/70">
                <CreditCard className="w-3 h-3 text-stone-500 shrink-0" />
                <span>Aceita Cartão</span>
              </span>
            )}
          </div>
        </section>

        {/* ================= CATÁLOGO DE PRODUTOS ================= */}
        <section className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                Catálogo de Produtos & Serviços
              </h2>
            </div>

            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
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

      {/* Botão Flutuante Mobile */}
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
