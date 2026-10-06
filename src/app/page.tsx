import React, { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SearchFilter } from "@/components/SearchFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { getBusinesses, getCategories } from "@/lib/data";
import { Store, Sparkles, ShieldCheck } from "lucide-react";

export const revalidate = 60;

interface HomePageProps {
  searchParams: Promise<{
    categoria?: string;
    bairro?: string;
    q?: string;
    abertos?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentCategory = params.categoria;
  const currentNeighborhood = params.bairro;
  const currentQuery = params.q;
  const onlyOpen = params.abertos === "1";

  const [categories, businesses] = await Promise.all([
    getCategories(),
    getBusinesses({
      categorySlug: currentCategory,
      neighborhood: currentNeighborhood,
      query: currentQuery,
      onlyOpen,
    }),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* Compact Hero Section */}
        <section className="bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-950 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold backdrop-blur-xs border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Conexão direta com microempreendedores locais</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug">
              Produtos e serviços do seu bairro direto no WhatsApp
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Sem taxas ou intermediários. Encontre o profissional, veja o catálogo e faça seu pedido direto pelo WhatsApp.
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Search & Filters */}
        <section className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <Suspense fallback={<div className="h-10 animate-pulse bg-stone-100 rounded-xl" />}>
            <SearchFilter
              categories={categories}
              currentCategory={currentCategory}
              currentNeighborhood={currentNeighborhood}
              currentQuery={currentQuery}
              currentOnlyOpen={onlyOpen}
            />
          </Suspense>
        </section>

        {/* Showcase Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>Vitrines em Destaque</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                {businesses.length}
              </span>
            </h2>
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-stone-200/80">
              <Store className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-800">
                Nenhum empreendedor encontrado
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Tente ajustar os filtros de categoria, status ou bairro para encontrar outros profissionais cadastrados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {businesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Feira Digital - Vitrine & Conexão Local via WhatsApp</span>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Acesso Administrador</span>
            </Link>
            <span className="text-stone-400">Desenvolvido com foco 100% no MEI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
