/**
 * Limpa o número de telefone e gera o link direto da API do WhatsApp
 */
export function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  // Se começar sem DDI 55 (Brasil) e tiver 10 ou 11 dígitos, adiciona 55
  if ((cleaned.length === 10 || cleaned.length === 11) && !cleaned.startsWith("55")) {
    return `55${cleaned}`;
  }

  return cleaned;
}

/**
 * Formata número para exibição humana amigável: (11) 99999-9999
 */
export function formatDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const localDigits = digits.startsWith("55") ? digits.slice(2) : digits;

  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  }
  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
  }
  return phone;
}

export function buildWhatsAppLink(phone: string, businessName?: string): string {
  const cleanNumber = formatWhatsAppNumber(phone);
  const defaultText = businessName
    ? `Olá! Encontrei o negócio *${businessName}* na Feira Digital e gostaria de mais informações.`
    : `Olá! Encontrei seu negócio na Feira Digital e gostaria de mais informações.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultText)}`;
}

export function buildProductWhatsAppLink(
  phone: string,
  businessName: string,
  productTitle: string,
  price: number,
  customMessageTemplate?: string | null
): string {
  const cleanNumber = formatWhatsAppNumber(phone);
  const priceFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  let text: string;
  if (customMessageTemplate && customMessageTemplate.trim().length > 0) {
    text = customMessageTemplate
      .replace(/{produto}/gi, productTitle)
      .replace(/{preco}/gi, priceFormatted)
      .replace(/{negocio}/gi, businessName);
  } else {
    text = `Olá, ${businessName}! Vi o produto *${productTitle}* (${priceFormatted}) na Feira Digital e gostaria de fazer um pedido.`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Link nativo para compartilhar o produto no WhatsApp com amigos (Social Proof & Viral Loop)
 */
export function buildProductShareLink(
  businessName: string,
  productTitle: string,
  price: number,
  storeUrl: string
): string {
  const priceFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  const text = `Olha o que encontrei na vitrine de *${businessName}* na Feira Digital:\n\n✨ *${productTitle}* por ${priceFormatted}\n\nDá uma olhada aqui: ${storeUrl}`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
