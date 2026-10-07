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
    <div className="flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:shadow-md hover:border-emerald-300 group">
      {/* Product Image (Proporção 1:1 rigorosa com object-cover - PRD 3.2) */}
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
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-1 bg-stone-50">
            <Package className="w-6 h-6" />
            <span className="text-[10px] font-medium text-stone-400">Sem foto</span>
          </div>
        )}

        {/* Botão de Compartilhar Rápido sobre a Imagem com Glassmorphism */}
        <button
          type="button"
          onClick={handleShareClick}
          title="Compartilhar este produto"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-stone-700 hover:text-emerald-700 hover:bg-white shadow-2xs backdrop-blur-md transition-all active:scale-90 cursor-pointer"
        >
          <Share2 className="w-3 h-3" />
        </button>
      </div>

      {/* Estrutura Interna de Informação - PRD 3.2 com fontes reduzidas e elegantes */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div className="space-y-1">
          {/* Título truncado em 2 linhas com tipografia balanceada */}
          <h3
            className="text-xs font-semibold text-stone-800 line-clamp-2 leading-snug min-h-[1.9rem] group-hover:text-emerald-700 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Descrição Curta */}
          {product.description && (
            <p className="text-[11px] text-stone-400 line-clamp-1 leading-normal">
              {product.description}
            </p>
          )}

          {/* Preço em Evidência com Tipografia Harmoniosa */}
          <div className="pt-0.5">
            <span className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight block">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Botão de Conversão WhatsApp Compacto e Elegante */}
        <div className="mt-auto pt-1">
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOrderClick}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold text-xs shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer text-center"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>Pedir no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
