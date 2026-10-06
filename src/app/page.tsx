import React, { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SearchFilter } from "@/components/SearchFilter";
import { BusinessCard } from "@/components/BusinessCard";
import { getBusinesses, getCategories } from "@/lib/data";
import { sortBusinessesByProximity } from "@/lib/geo";
import { Store, Sparkles, Navigation, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    categoria?: string;
    bairro?: string;
    q?: string;
    abertos?: string;
    lat?: string;
    lng?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentCategory = params.categoria;
  const currentNeighborhood = params.bairro;
  const currentQuery = params.q;
  const onlyOpen = params.abertos === "1";
  const userLat = params.lat ? parseFloat(params.lat) : undefined;
  const userLng = params.lng ? parseFloat(params.lng) : undefined;

  const [categories, rawBusinesses] = await Promise.all([
    getCategories(),
    getBusinesses({
      categorySlug: currentCategory,
      neighborhood: currentNeighborhood,
      query: currentQuery,
      onlyOpen,
    }),
  ]);

  const businesses = sortBusinessesByProximity(rawBusinesses, {
    lat: userLat,
    lng: userLng,
    neighborhood: currentNeighborhood,
  });

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* Compact Hero Section */}
        <section className="bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-950 text-white rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold backdrop-blur-xs border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conexão direta com microempreendedores locais</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight sm:leading-snug text-white">
              Produtos e serviços do seu bairro direto no{" "}
              <span className="text-emerald-400">WhatsApp</span>
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Sem taxas ou intermediários. Encontre fornecedores locais de confiança, consulte cardápios e feche seu pedido com um toque.
            </p>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Search & Filters */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/70 shadow-xs">
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
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <span>Vitrines em Destaque</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                {businesses.length} {businesses.length === 1 ? "loja" : "lojas"}
              </span>
            </h2>

            {userLat !== undefined && userLng !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                <Navigation className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Mais próximos de você</span>
              </span>
            )}
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
                <Store className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                  Nenhum estabelecimento encontrado nesta região
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Não localizamos lojas para os filtros selecionados. Tente ajustar os termos de busca ou seja o primeiro a divulgar sua marca aqui!
                </p>
              </div>

              {/* Chamada Secundária Construtiva para Incentivar Novos Cadastros (PRD 4.0) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all active:scale-95"
                >
                  Limpar Filtros
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cadastrar Minha Loja Grátis</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
