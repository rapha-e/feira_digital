/**
 * Utilitário Centralizado de Rastreamento de Métricas e Anúncios
 * Compatível com: Google Analytics 4 (GA4), Google Ads e Meta Pixel
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
export const GADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GADS_CONVERSION_ID || "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

/**
 * Disparo genérico para dataLayer e Google Tag
 */
export function trackEvent(
  eventName: string,
  eventParams: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;

  try {
    // 1. Google Analytics 4 & Google Ads (gtag)
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, eventParams);
    } else if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
      });
    }

    // 2. Meta Pixel (Facebook / Instagram Ads)
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, eventParams);
    }
  } catch (err) {
    console.debug("Analytics event dispatch ignored:", err);
  }
}

/**
 * Evento Principal de Conversão: Clique para o WhatsApp (Lead Gerado)
 * Essencial para otimizar campanhas de Google Ads (Max Leads / Conversões)
 */
export function trackWhatsAppLead(params: {
  businessId?: string;
  businessName?: string;
  productTitle?: string;
  price?: number;
  neighborhood?: string;
}) {
  const payload = {
    event_category: "Conversion",
    event_label: params.businessName || "WhatsApp Contact",
    store_id: params.businessId,
    store_name: params.businessName,
    product_name: params.productTitle || "Contato Geral",
    value: params.price || 0,
    currency: "BRL",
    neighborhood: params.neighborhood || "",
  };

  // Envia evento padrão de geração de lead para GA4 e Google Ads
  trackEvent("generate_lead", payload);
  trackEvent("whatsapp_click", payload);

  // Se houver Google Ads Conversion ID configurado
  if (typeof window !== "undefined" && typeof window.gtag === "function" && GADS_CONVERSION_ID) {
    window.gtag("event", "conversion", {
      send_to: GADS_CONVERSION_ID,
      value: params.price || 0,
      currency: "BRL",
    });
  }

  // Meta Pixel padrão Lead
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead", {
      content_name: params.businessName,
      value: params.price || 0,
      currency: "BRL",
    });
  }
}

/**
 * Evento: Visualização de Vitrine de Loja
 */
export function trackStoreViewEvent(params: {
  businessId?: string;
  businessName?: string;
  category?: string;
}) {
  trackEvent("view_store", {
    store_id: params.businessId,
    store_name: params.businessName,
    category: params.category,
  });
}

/**
 * Evento: Busca Realizada pelo Usuário
 */
export function trackSearchEvent(params: {
  query?: string;
  neighborhood?: string;
  category?: string;
}) {
  trackEvent("search", {
    search_term: params.query,
    neighborhood_filter: params.neighborhood,
    category_filter: params.category,
  });
}

/**
 * Evento: Cadastro de Novo Empreendedor Concluído
 */
export function trackNewBusinessRegistration(params: {
  businessName?: string;
  category?: string;
  city?: string;
}) {
  trackEvent("sign_up", {
    method: "business_registration",
    business_name: params.businessName,
    category: params.category,
    city: params.city,
  });
}
