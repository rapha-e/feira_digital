"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MessageCircle, Package, Share2, Check } from "lucide-react";
import { Product } from "@/types";
import { buildProductWhatsAppLink, buildProductShareLink } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/app/actions";
import { trackWhatsAppLead } from "@/lib/analytics";

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
    trackWhatsAppLead({
      businessId,
      businessName,
      productTitle: product.title,
      price: product.price,
    });
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
    <div className="flex flex-col bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-emerald-300/80 hover:-translate-y-0.5 group">
      {/* Product Image (Proporção 1:1 rigorosa com object-cover - PRD 3.2) */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-1 bg-stone-50">
            <Package className="w-7 h-7" />
            <span className="text-[10px] font-medium text-stone-400">Sem foto</span>
          </div>
        )}

        {/* Botão de Compartilhar Rápido sobre a Imagem com Glassmorphism */}
        <button
          type="button"
          onClick={handleShareClick}
          title="Compartilhar este produto"
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-stone-700 hover:text-emerald-700 hover:bg-white shadow-sm backdrop-blur-md transition-all active:scale-90 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Estrutura Interna de Informação - PRD 3.2 */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          {/* Título truncado em 2 linhas com tipografia balanceada */}
          <h3
            className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-emerald-800 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Descrição Curta */}
          {product.description && (
            <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-1 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Preço em Evidência com Tipografia Nobre */}
          <div className="pt-1">
            <span className="text-base sm:text-lg font-black text-stone-950 tracking-tight block">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Botão de Conversão WhatsApp com Design de Boutique */}
        <div className="mt-auto pt-1">
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOrderClick}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:from-[#20bd5a] hover:to-[#17a34f] active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30 transition-all duration-200 cursor-pointer text-center"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span>Pedir no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
