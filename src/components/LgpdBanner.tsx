"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export function LgpdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem("feira_lgpd_accepted");
      if (!accepted) {
        setVisible(true);
      }
    } catch {
      // Ignora erro de storage
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("feira_lgpd_accepted", "true");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Aviso de Privacidade e Cookies"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xl rounded-2xl p-4 sm:p-4.5 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs text-stone-600 leading-relaxed">
          <p>
            Utilizamos armazenamento local temporário para calcular a proximidade dos comércios da sua região e aprimorar sua experiência. Seus dados nunca são vendidos. Saiba mais em nossa{" "}
            <Link
              href="/privacidade"
              className="text-emerald-700 underline font-semibold hover:text-emerald-800"
            >
              Política de Privacidade
            </Link>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAccept}
          aria-label="Fechar aviso de privacidade"
          className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
        <button
          type="button"
          onClick={handleAccept}
          className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
        >
          Entendi e Concordo
        </button>
      </div>
    </aside>
  );
}
