"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MessageCircle, Package, Share2, Check } from "lucide-react";
import { Product } from "@/types";
import { buildProductWhatsAppLink, buildProductShareLink } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/app/actions";

interface ProductCardProps {
  product: Product;
  businessName: string;
  businessWhatsApp: string;
  businessId?: string;
  storeSlug?: string;
}

export function ProductCard({
  product,
  businessName,
  businessWhatsApp,
  businessId,
  storeSlug,
}: ProductCardProps) {
  const [copied, setCopied] = useState(false);

  const whatsappOrderUrl = buildProductWhatsAppLink(
    businessWhatsApp,
    businessName,
    product.title,
    product.price,
    product.custom_whatsapp_message
  );

  const storeUrl = typeof window !== "undefined" && storeSlug
    ? `${window.location.origin}/${storeSlug}`
    : `https://feiradigital.local/${storeSlug || ""}`;

  const whatsappShareUrl = buildProductShareLink(
    businessName,
    product.title,
    product.price,
    storeUrl
  );

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  const handleOrderClick = () => {
    if (businessId) {
      trackWhatsAppClick(businessId).catch(() => {});
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    // Se for em ambiente que suporta navigator.share, tenta usar, senão abre o link do WhatsApp
    if (typeof navigator !== "undefined" && navigator.share) {
      e.preventDefault();
      navigator
        .share({
          title: `${product.title} - ${businessName}`,
          text: `Confira ${product.title} (${formattedPrice}) na loja de ${businessName}!`,
          url: storeUrl,
        })
        .catch(() => {
          window.open(whatsappShareUrl, "_blank");
        });
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md hover:border-emerald-200 group">
      {/* Product Image (Square Aspect Ratio) */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-1">
            <Package className="w-6 h-6" />
            <span className="text-[10px]">Sem foto</span>
          </div>
        )}

        {/* Botão sutil de Compartilhamento no topo da foto */}
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleShareClick}
          title="Compartilhar no WhatsApp"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-stone-600 hover:text-emerald-600 hover:bg-white shadow-xs backdrop-blur-xs transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-2">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-1 mb-1">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1" title={product.title}>
              {product.title}
            </h3>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-600 whitespace-nowrap">
              {formattedPrice}
            </span>
          </div>

          {product.description && (
            <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-1 sm:line-clamp-2 leading-snug">
              {product.description}
            </p>
          )}
        </div>

        {/* Ações: Pedir no Whats & Compartilhar */}
        <div className="mt-auto flex items-center gap-1.5">
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOrderClick}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 hover:bg-[#25D366] hover:text-white font-semibold text-[11px] sm:text-xs border border-emerald-200/80 transition-all duration-200 active:scale-[0.98]"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Pedir no Whats</span>
          </a>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShareClick}
            title="Indicar pelo WhatsApp"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200/80 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
