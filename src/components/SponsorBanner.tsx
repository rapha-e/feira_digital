"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles, ExternalLink, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { Sponsor } from "@/types";

interface SponsorBannerProps {
  sponsors: Sponsor[];
  placement?: "home" | "painel";
}

export function SponsorBanner({ sponsors, placement = "home" }: SponsorBannerProps) {
  const viewedRef = useRef<Set<string>>(new Set());

  // Seleciona um patrocinador ativo para exibição (ou rotativo)
  const availableSponsors = sponsors.filter(
    s => s.is_active && (s.placement === placement || s.placement === "all")
  );

  const sponsor = availableSponsors[0];

  useEffect(() => {
    if (sponsor && !viewedRef.current.has(sponsor.id)) {
      viewedRef.current.add(sponsor.id);
      // Registra a visualização
      fetch(`/api/sponsors/${sponsor.id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [sponsor]);

  if (!sponsor) return null;

  return (
    <aside
      aria-label="Anúncio Patrocinado Oficial"
      className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-stone-50 to-emerald-500/10 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Lado Esquerdo: Imagem + Textos */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {sponsor.image_url ? (
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl overflow-hidden border border-amber-200/90 shadow-2xs bg-white">
              <Image
                src={sponsor.image_url}
                alt={sponsor.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{sponsor.badge_text || "Parceiro Oficial"}</span>
              </span>
              <span className="text-xs font-semibold text-stone-500 truncate">
                {sponsor.name}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug tracking-tight">
              {sponsor.title}
            </h3>

            {sponsor.subtitle && (
              <p className="text-xs text-stone-600 line-clamp-1 sm:line-clamp-none">
                {sponsor.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Lado Direito: Botão de Ação (CTA) com Tracking */}
        <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
          <a
            href={`/api/sponsors/${sponsor.id}/click`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 sm:px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>{sponsor.cta_text || "Saiba Mais"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
          </a>
        </div>
      </div>
    </aside>
  );
}
