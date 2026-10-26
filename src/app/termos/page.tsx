import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { FileText, ArrowLeft, CheckCircle2, AlertCircle, Store } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Feira Digital",
  description:
    "Condições gerais de uso da plataforma de vitrines para microempreendedores locais Feira Digital.",
  alternates: {
    canonical: "/termos",
  },
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Feira Digital</span>
        </Link>

        <header className="space-y-3 border-b border-stone-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Regras e Transparência</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Termos de Uso da Plataforma
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Última atualização: Outubro de 2026 • Versão 2.0
          </p>
        </header>

        <div className="prose prose-stone max-w-none space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <span>1. Objeto e Natureza do Serviço</span>
            </h2>
            <p>
              A <strong>Feira Digital</strong> é um catálogo comunitário e vitrine digital desenhada para promover microempreendedores individuais (MEIs), pequenos comércios e prestadores de serviços do Distrito Federal. A plataforma funciona como facilitadora de contato, direcionando o consumidor diretamente ao canal de WhatsApp oficial do estabelecimento anunciado.
            </p>
          </section>

          <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>2. Responsabilidade sobre Produtos e Transações</span>
            </h2>
            <p>
              As transações financeiras, entrega física, preparo de alimentos e garantia de produtos/serviços são de responsabilidade exclusiva entre o <strong>Consumidor</strong> e o <strong>Empreendedor anunciante</strong>. A Feira Digital não processa pagamentos em sua plataforma, não cobra comissões por venda e não atua como intermediadora financeira.
            </p>
          </section>

          <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
              <span>3. Regras de Conduta para Empreendedores</span>
            </h2>
            <p>
              É expressamente proibido anunciar produtos ilegais, substâncias proibidas por lei, réplicas não autorizadas ou veicular imagens com conteúdo ofensivo ou calunioso. Vitrines que violarem as diretrizes comunitárias serão suspensas imediatamente pela moderação da plataforma.
            </p>
          </section>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Feira Digital - Todos os direitos reservados</span>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-stone-900 transition-colors">Privacidade</Link>
            <Link href="/" className="hover:text-stone-900 transition-colors">Página Inicial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
