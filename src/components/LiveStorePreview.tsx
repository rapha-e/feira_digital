"use client";

import React from "react";
import Image from "next/image";
import {
  Store,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  Truck,
  CreditCard,
  QrCode,
  Package,
} from "lucide-react";
import { Product } from "@/types";

interface LiveStorePreviewProps {
  name: string;
  categoryName?: string;
  avatarUrl?: string;
  bio?: string;
  neighborhood: string;
  city: string;
  whatsapp: string;
  isOpen: boolean;
  freeDelivery: boolean;
  storePickup: boolean;
  acceptsPix: boolean;
  acceptsCard: boolean;
  products: Product[];
}

export function LiveStorePreview({
  name,
  categoryName,
  avatarUrl,
  bio,
  neighborhood,
  city,
  whatsapp,
  isOpen,
  freeDelivery,
  storePickup,
  acceptsPix,
  acceptsCard,
  products,
}: LiveStorePreviewProps) {
  const displayName = name.trim() || "Nome da Sua Loja";
  const displayNeighborhood = neighborhood.trim() || "Seu Bairro";
  const displayCity = city.trim() || "Sua Cidade";

  return (
    <div className="w-full max-w-sm mx-auto bg-stone-900 rounded-[38px] p-3 shadow-2xl border-4 border-stone-800">
      {/* Notch do Mockup */}
      <div className="w-full flex justify-center pb-2">
        <div className="w-24 h-4 bg-stone-800 rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-900 mr-2" />
          <div className="w-2 h-2 rounded-full bg-stone-700" />
        </div>
      </div>

      {/* Tela do Celular */}
      <div className="bg-stone-50 rounded-[28px] overflow-hidden border border-stone-200 flex flex-col max-h-[580px] overflow-y-auto shadow-inner text-stone-900 select-none">
        {/* Banner do Perfil */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-stone-900 text-white p-4 pt-5 relative">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border-2 border-white/40 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Store className="w-7 h-7 text-white/90" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-emerald-100 backdrop-blur-xs mb-1">
                <Sparkles className="w-2.5 h-2.5" />
                {categoryName || "Geral"}
              </span>
              <h3 className="font-bold text-sm leading-tight truncate text-white">
                {displayName}
              </h3>
              <p className="text-[11px] text-emerald-100/90 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {displayNeighborhood}, {displayCity}
                </span>
              </p>
            </div>
          </div>

          {/* Badges de Atendimento */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                isOpen ? "bg-emerald-500/30 text-emerald-100 border border-emerald-400/40" : "bg-stone-800/60 text-stone-300"
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              {isOpen ? "Aberto Agora" : "Fechado"}
            </span>

            {freeDelivery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-200 border border-amber-400/30">
                <Truck className="w-2.5 h-2.5" />
                Entrega Grátis
              </span>
            )}
          </div>
        </div>

        {/* Bio da Loja */}
        <div className="p-3 bg-white border-b border-stone-200/60">
          <p className="text-[11px] text-stone-600 line-clamp-2 italic">
            {bio?.trim() || "Bem-vindo à nossa loja! Faça seu pedido direto no WhatsApp."}
          </p>

          {/* Formas de Pagamento e Retirada */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-500 flex-wrap">
            {acceptsPix && (
              <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <QrCode className="w-3 h-3" /> Pix
              </span>
            )}
            {acceptsCard && (
              <span className="flex items-center gap-0.5 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                <CreditCard className="w-3 h-3" /> Cartão
              </span>
            )}
            {storePickup && (
              <span className="flex items-center gap-0.5 text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                Retirada no Local
              </span>
            )}
          </div>
        </div>

        {/* Vitrine de Produtos */}
        <div className="p-3 space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">
              Produtos ({products.length})
            </span>
            <span className="text-[10px] text-stone-400">Cardápio / Catálogo</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-6 px-3 bg-white rounded-2xl border border-dashed border-stone-200">
              <Package className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-stone-700">Nenhum produto ainda</p>
              <p className="text-[10px] text-stone-400">
                Cadastre seus itens para aparecerem aqui na vitrine
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-stone-200/80 p-2 overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-square bg-stone-100 rounded-lg overflow-hidden mb-1.5">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-stone-900 line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      R$ {Number(p.price).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de WhatsApp Inferior */}
        <div className="p-3 bg-white border-t border-stone-200/80 sticky bottom-0">
          <div className="w-full py-2 bg-emerald-600 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Phone className="w-3.5 h-3.5" />
            Pedir pelo WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}
