import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { WhatsAppButton } from "@/components/WhatsAppButton";
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
  const productLimit = business.product_limit || 5;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pb-24 md:pb-12">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-5 space-y-4">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors py-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para todas as vitrines</span>
          </Link>
        </div>

        {/* Business Hero Card - Compact */}
        <section className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              {/* Avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
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
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <Store className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Selo Dourado de Destaque Patrocinado */}
                  {business.is_featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 shadow-2xs border border-amber-400">
                      <Sparkles className="w-3 h-3 fill-amber-950 text-amber-950" />
                      <span>DESTAQUE PATROCINADO</span>
                    </span>
                  )}

                  {/* Selo MEI Verificado */}
                  {business.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>MEI Verificado</span>
                    </span>
                  )}

                  {business.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {business.category.name}
                    </span>
                  )}

                  {/* Status Operacional */}
                  {isOpen ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Aberto no WhatsApp
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                      Fechado no momento
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-stone-500 font-medium">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {business.neighborhood}, {business.city}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {business.name}
                </h1>

                {business.bio && (
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
                    {business.bio}
                  </p>
                )}

                {/* Tags de Entrega e Pagamento */}
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {business.free_delivery && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      <Truck className="w-3 h-3 text-emerald-600" />
                      Entrega Grátis na Cidade
                    </span>
                  )}
                  {business.store_pickup && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      <ShoppingBag className="w-3 h-3 text-stone-500" />
                      Retirada no Local
                    </span>
                  )}
                  {business.accepts_pix && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      <QrCode className="w-3 h-3 text-emerald-600" />
                      Aceita Pix
                    </span>
                  )}
                  {business.accepts_card && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                      <CreditCard className="w-3 h-3 text-stone-500" />
                      Aceita Cartão
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop inline WhatsApp button */}
            <div className="shrink-0 hidden sm:block">
              <WhatsAppButton
                href={mainWhatsAppUrl}
                businessId={business.id}
                label="Falar no WhatsApp"
              />
            </div>
          </div>
        </section>

        {/* Catalog Showcase */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Catálogo de Produtos & Serviços</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                {business.products?.length || 0}/{productLimit} itens
              </span>
            </h2>
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

      {/* Mobile Floating Conversion Button (Sticky Bottom) */}
      <WhatsAppButton
        href={mainWhatsAppUrl}
        businessId={business.id}
        label="Falar no WhatsApp"
        variant="floating"
      />
    </div>
  );
}
