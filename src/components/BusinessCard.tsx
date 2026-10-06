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
} from "lucide-react";
import { BusinessWithProducts } from "@/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppButton } from "./WhatsAppButton";

interface BusinessCardProps {
  business: BusinessWithProducts;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const whatsappUrl = buildWhatsAppLink(business.whatsapp, business.name);
  const isOpen = business.is_open !== false;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden relative">
      {/* Top Banner / Avatar Area */}
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
          {business.avatar_url ? (
            <Image
              src={business.avatar_url}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
              <Store className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {/* Categoria */}
            {business.category && (
              <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {business.category.name}
              </span>
            )}

            {/* Selo Status Operacional */}
            {isOpen ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Aberto no Whats
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                Fechado
              </span>
            )}
          </div>

          <Link
            href={`/${business.slug}`}
            className="block text-sm sm:text-base font-bold text-stone-900 truncate hover:text-emerald-600 transition-colors"
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
        <div className="px-3.5 sm:px-4 pb-2.5">
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {business.bio}
          </p>
        </div>
      )}

      {/* Tags de Entrega e Pagamento (Pilar 2) */}
      <div className="px-3.5 sm:px-4 pb-2 flex flex-wrap gap-1.5">
        {business.free_delivery && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            <Truck className="w-3 h-3 text-emerald-600" />
            Entrega Grátis
          </span>
        )}
        {business.store_pickup && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            <ShoppingBag className="w-3 h-3 text-stone-500" />
            Retirada
          </span>
        )}
        {business.accepts_pix && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            <QrCode className="w-3 h-3 text-emerald-600" />
            Pix
          </span>
        )}
        {business.accepts_card && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            <CreditCard className="w-3 h-3 text-stone-500" />
            Cartão
          </span>
        )}
      </div>

      {/* Product preview thumbnails if available */}
      {business.products && business.products.length > 0 && (
        <div className="px-3.5 sm:px-4 pb-3 mt-auto">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-stone-400 mb-1.5">
            <span>Destaques</span>
            <span>{business.products.length}/5 itens</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {business.products.slice(0, 3).map(product => (
              <div
                key={product.id}
                className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-stone-100 border border-stone-200"
                title={`${product.title} - R$ ${product.price.toFixed(2)}`}
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="44px"
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

      {/* Action Footer */}
      <div className="mt-auto p-2.5 sm:p-3 bg-stone-50/80 border-t border-stone-100 flex items-center gap-2">
        <Link
          href={`/${business.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
          <span>Ver Vitrine</span>
          <ArrowRight className="w-3 h-3 text-stone-400" />
        </Link>
        <WhatsAppButton
          href={whatsappUrl}
          businessId={business.id}
          label="WhatsApp"
          variant="secondary"
          className="shrink-0 py-2 px-2.5 text-xs"
        />
      </div>
    </div>
  );
}
