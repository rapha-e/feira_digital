import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sparkles, ArrowRight, Store, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface InvitePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { slug } = await params;
  const decodedName = decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center items-center text-center">
        {/* Badge de Convite */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Você foi convidado para a Feira Digital!</span>
        </div>

        {/* Card Principal de Boas-Vindas */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <Store className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Sua vitrine <span className="text-emerald-600">{decodedName}</span> está quase pronta!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              Crie seu catálogo gratuito em menos de 2 minutos e comece a receber pedidos direto no seu WhatsApp, sem taxas ou comissões.
            </p>
          </div>

          {/* Benefícios rápidos */}
          <div className="bg-stone-50 rounded-2xl p-4 text-left space-y-2.5 border border-stone-200/70">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Link exclusivo da sua loja: feira/{slug}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cadastro estilo maquininha em 20 segundos</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% gratuito e focado no microempreendedor</span>
            </div>
          </div>

          {/* CTA para Cadastro */}
          <Link
            href={`/login?invitedSlug=${encodeURIComponent(slug)}&invitedName=${encodeURIComponent(decodedName)}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            <span>Criar Minha Vitrine Grátis Agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-[11px] text-stone-400">
            Leva menos de 1 minuto e você já pode cadastrar seus primeiros produtos.
          </p>
        </div>
      </main>
    </div>
  );
}
