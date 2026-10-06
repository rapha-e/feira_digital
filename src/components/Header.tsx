import React from "react";
import Link from "next/link";
import { Store, UserCheck, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg text-stone-900 tracking-tight block leading-tight">
              Feira<span className="text-emerald-600">Digital</span>
            </span>
            <span className="text-[10px] text-stone-500 font-medium block leading-none">
              Comércio Local & MEIs
            </span>
          </div>
        </Link>

        {/* CTAs: Admin & Empreendedor */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-semibold transition-all"
            title="Acesso Administrativo"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <Link
            href="/painel"
            className="inline-flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.98] shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Sou Empreendedor</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
