"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  X,
  Store,
  Utensils,
  Sparkles,
  Gift,
  Wrench,
  Shirt,
  Heart,
} from "lucide-react";
import { Category } from "@/types";

interface SearchFilterProps {
  categories: Category[];
  currentCategory?: string;
  currentNeighborhood?: string;
  currentQuery?: string;
  currentOnlyOpen?: boolean;
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case "alimentacao-bebidas":
    case "alimentacao-confeitaria":
      return <Utensils className="w-3.5 h-3.5 shrink-0" />;
    case "beleza-estetica":
      return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    case "artesanato-presentes":
    case "artesanato-moda":
      return <Gift className="w-3.5 h-3.5 shrink-0" />;
    case "servicos-gerais":
    case "servicos-manutencao":
      return <Wrench className="w-3.5 h-3.5 shrink-0" />;
    case "moda-acessorios":
      return <Shirt className="w-3.5 h-3.5 shrink-0" />;
    case "pet-cuidados":
    case "pet-shop-animais":
      return <Heart className="w-3.5 h-3.5 shrink-0" />;
    default:
      return <Store className="w-3.5 h-3.5 shrink-0" />;
  }
}

export function SearchFilter({
  categories,
  currentCategory,
  currentNeighborhood,
  currentQuery,
  currentOnlyOpen,
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState(currentQuery || "");
  const [neighborhood, setNeighborhood] = React.useState(currentNeighborhood || "");

  const handleFilter = (options?: { catSlug?: string; toggleOnlyOpen?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (options?.catSlug !== undefined) {
      if (options.catSlug) {
        params.set("categoria", options.catSlug);
      } else {
        params.delete("categoria");
      }
    }

    if (options?.toggleOnlyOpen !== undefined) {
      if (options.toggleOnlyOpen) {
        params.set("abertos", "1");
      } else {
        params.delete("abertos");
      }
    }

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    if (neighborhood.trim()) {
      params.set("bairro", neighborhood.trim());
    } else {
      params.delete("bairro");
    }

    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery("");
    setNeighborhood("");
    router.push("/");
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentNeighborhood || currentQuery || currentOnlyOpen
  );

  return (
    <div className="w-full space-y-3.5">
      {/* Search Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleFilter();
        }}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por produto, serviço ou loja..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
          />
        </div>

        <div className="relative sm:w-64">
          <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={neighborhood}
            onChange={e => setNeighborhood(e.target.value)}
            placeholder="Bairro ou RA (ex: Gama)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
          />
        </div>

        <button
          type="submit"
          className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-xs cursor-pointer shrink-0"
        >
          Filtrar
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
            title="Limpar todos os filtros"
          >
            <X className="w-4 h-4 text-stone-500" />
            <span>Limpar</span>
          </button>
        )}
      </form>

      {/* Category Pills & Status Filter: Todas as modalidades visíveis */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
        {/* Toggle Abertos Agora */}
        <button
          type="button"
          onClick={() => handleFilter({ toggleOnlyOpen: !currentOnlyOpen })}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            currentOnlyOpen
              ? "bg-emerald-600 text-white shadow-xs font-bold"
              : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              currentOnlyOpen ? "bg-white animate-pulse" : "bg-emerald-500"
            }`}
          />
          <span>Abertos no WhatsApp</span>
        </button>

        <div className="h-4 w-px bg-stone-200 shrink-0 mx-0.5 hidden sm:block" />

        {/* Todas as Modalidades */}
        <button
          type="button"
          onClick={() => handleFilter({ catSlug: "" })}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            !currentCategory
              ? "bg-stone-900 text-white shadow-xs font-bold"
              : "bg-white text-stone-700 border border-stone-200 hover:border-emerald-300 hover:bg-stone-50"
          }`}
        >
          <Store className="w-3.5 h-3.5 text-emerald-500" />
          <span>Todas</span>
        </button>

        {/* Modalidades Individuais */}
        {categories.map(cat => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleFilter({ catSlug: cat.slug })}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "bg-white text-stone-700 border border-stone-200 hover:border-emerald-300 hover:bg-stone-50"
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
