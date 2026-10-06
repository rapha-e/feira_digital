import React from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { PackageOpen } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  businessName: string;
  businessWhatsApp: string;
  businessId?: string;
  storeSlug?: string;
}

export function ProductGrid({
  products,
  businessName,
  businessWhatsApp,
  businessId,
  storeSlug,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-2xl bg-stone-50 border border-stone-200/80">
        <PackageOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
        <h4 className="text-xs sm:text-sm font-semibold text-stone-700">Nenhum produto cadastrado</h4>
        <p className="text-[11px] sm:text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Fale diretamente com o empreendedor pelo WhatsApp para conferir novidades!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          businessName={businessName}
          businessWhatsApp={businessWhatsApp}
          businessId={businessId}
          storeSlug={storeSlug}
        />
      ))}
    </div>
  );
}
