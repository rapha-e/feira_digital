import React, { Suspense } from "react";
import Link from "next/link";
import { Store, UserCheck, ShieldCheck } from "lucide-react";
import { LocationSelector } from "./LocationSelector";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-lg text-stone-900 tracking-tight block leading-tight">
              Feira<span className="text-emerald-600">Digital</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium hidden xs:block leading-none">
              Comércio Local & MEIs
            </span>
          </div>
        </Link>

        {/* RF04: Seletor de Localização no Topo */}
        <div className="flex items-center justify-center">
          <Suspense fallback={<div className="w-24 h-7 bg-stone-100 rounded-xl animate-pulse" />}>
            <LocationSelector />
          </Suspense>
        </div>

        {/* CTAs: Admin & Empreendedor */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-semibold transition-all"
            title="Acesso Administrativo"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <Link
            href="/painel"
            className="inline-flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.98] shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="hidden xs:inline">Sou Empreendedor</span>
            <span className="xs:hidden">Entrar</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
