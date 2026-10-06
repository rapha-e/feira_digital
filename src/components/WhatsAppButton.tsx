"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "@/app/actions";
import { trackWhatsAppLead } from "@/lib/analytics";

interface WhatsAppButtonProps {
  href: string;
  label?: string;
  variant?: "primary" | "secondary" | "floating";
  className?: string;
  businessId?: string;
  businessName?: string;
}

export function WhatsAppButton({
  href,
  label = "Falar no WhatsApp",
  variant = "primary",
  className = "",
  businessId,
  businessName,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    if (businessId) {
      trackWhatsAppClick(businessId).catch(() => {});
    }
    trackWhatsAppLead({
      businessId,
      businessName,
    });
  };

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer";

  if (variant === "floating") {
    return (
      <div className="fixed bottom-4 inset-x-4 z-50 md:hidden">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`${baseStyles} w-full py-3.5 px-6 rounded-2xl bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-xl shadow-green-600/30 text-base font-bold text-center ${className}`}
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>{label}</span>
        </a>
      </div>
    );
  }

  if (variant === "secondary") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`${baseStyles} py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 text-xs sm:text-sm ${className}`}
      >
        <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${baseStyles} py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-md shadow-emerald-500/20 text-sm sm:text-base font-bold ${className}`}
    >
      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
      <span>{label}</span>
    </a>
  );
}
