import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ArrowRight,
  Store,
  Truck,
  ShoppingBag,
  CreditCard,
  QrCode,
  Navigation,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { BusinessWithProducts } from "@/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatDistance } from "@/lib/geo";
import { WhatsAppButton } from "./WhatsAppButton";

interface BusinessCardProps {
  business: BusinessWithProducts;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const whatsappUrl = buildWhatsAppLink(business.whatsapp, business.name);
  const isOpen = business.is_open !== false;
  const isFeatured = Boolean(business.is_featured);

  return (
    <div
      className={`group flex flex-col bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden relative ${
        isFeatured
          ? "border-2 border-amber-300/90 ring-1 ring-amber-300/40 hover:border-amber-400"
          : "border border-stone-200/70 hover:border-emerald-200/80"
      }`}
    >
      {/* Top Banner / Avatar Area */}
      <div className="p-4 flex items-start gap-3.5">
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
          {business.avatar_url ? (
            <Image
              src={business.avatar_url}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="72px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
              <Store className="w-7 h-7" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {/* Selo Dourado de Destaque Patrocinado */}
            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 shadow-2xs border border-amber-400/80 animate-pulse">
                <Sparkles className="w-2.5 h-2.5 fill-amber-950 text-amber-950 shrink-0" />
                <span>DESTAQUE</span>
              </span>
            )}

            {/* Selo MEI Verificado */}
            {business.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <BadgeCheck className="w-3 h-3 text-blue-600 shrink-0" />
                <span>Verificado</span>
              </span>
            )}

            {/* Categoria */}
            {business.category && (
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200/80">
                {business.category.name}
              </span>
            )}

            {/* RF04: Selo de Proximidade */}
            {business.distance_km !== undefined && business.distance_km !== null && business.distance_km < 900 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-2xs">
                <Navigation className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600 shrink-0" />
                <span>A {formatDistance(business.distance_km)}</span>
              </span>
            )}

            {/* Selo Status Operacional */}
            {isOpen ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Aberto no Whats
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                Fechado
              </span>
            )}
          </div>

          <Link
            href={`/${business.slug}`}
            className="block text-sm sm:text-base font-extrabold text-stone-900 truncate group-hover:text-emerald-700 transition-colors"
          >
            {business.name}
          </Link>
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-stone-500 mt-0.5">
            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">
              {business.neighborhood}, {business.city}
            </span>
          </div>
        </div>
      </div>

      {/* Bio Description */}
      {business.bio && (
        <div className="px-4 pb-2.5">
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {business.bio}
          </p>
        </div>
      )}

      {/* Tags de Entrega e Pagamento (Pilar 2) */}
      <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
        {business.free_delivery && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/80">
            <Truck className="w-3 h-3 text-emerald-600" />
            Entrega Grátis
          </span>
        )}
        {business.store_pickup && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/80">
            <ShoppingBag className="w-3 h-3 text-stone-500" />
            Retirada
          </span>
        )}
        {business.accepts_pix && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <QrCode className="w-3 h-3 text-emerald-600" />
            Pix
          </span>
        )}
        {business.accepts_card && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/80">
            <CreditCard className="w-3 h-3 text-stone-500" />
            Cartão
          </span>
        )}
      </div>

      {/* Product preview thumbnails if available (Proporção 1:1) */}
      {business.products && business.products.length > 0 && (
        <div className="px-4 pb-3 mt-auto">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            <span>Destaques</span>
            <span>{business.products.length} itens</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {business.products.slice(0, 3).map(product => (
              <div
                key={product.id}
                className="relative w-12 h-12 shrink-0 aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs"
                title={`${product.title} - R$ ${product.price.toFixed(2)}`}
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400 p-0.5 text-center leading-tight">
                    {product.title.slice(0, 8)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer com Micro-interações táteis - PRD 3.3 */}
      <div className="mt-auto p-3 bg-stone-50/90 border-t border-stone-100 flex items-center gap-2">
        <Link
          href={`/${business.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 hover:bg-stone-100 hover:text-stone-950 active:scale-[0.98] transition-all duration-150 shadow-2xs"
        >
          <span>Ver Vitrine</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>
        <WhatsAppButton
          href={whatsappUrl}
          businessId={business.id}
          label="WhatsApp"
          variant="secondary"
          className="shrink-0 py-2.5 px-3 text-xs active:scale-95 transition-all duration-150"
        />
      </div>
    </div>
  );
}
