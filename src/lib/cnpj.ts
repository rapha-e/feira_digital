/**
 * Utilitários para validação e consulta inteligente de CNPJ
 * Integração gratuita com a BrasilAPI e Receita Federal
 */

export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function validateCnpj(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === Number(digits.charAt(1));
}

export interface CnpjData {
  cnpj: string;
  name: string; // Nome Fantasia ou Razão Social limpa
  legalName: string;
  cep: string;
  streetAddress: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  phone?: string;
  cnaeCode?: number;
  cnaeDescription?: string;
}

/**
 * Mapeia descrição ou código do CNAE para categorias comuns da Feira Digital
 */
export function mapCnaeToCategory(cnaeText?: string): string {
  if (!cnaeText) return "";
  const t = cnaeText.toLowerCase();

  if (
    t.includes("alimento") ||
    t.includes("restaurante") ||
    t.includes("lanchonete") ||
    t.includes("bebida") ||
    t.includes("confeitaria") ||
    t.includes("padaria") ||
    t.includes("marmita") ||
    t.includes("bolo")
  ) {
    return "alimentacao-bebidas";
  }

  if (
    t.includes("beleza") ||
    t.includes("cabelo") ||
    t.includes("estetica") ||
    t.includes("manicure") ||
    t.includes("barbearia") ||
    t.includes("maquiagem")
  ) {
    return "beleza-estetica";
  }

  if (
    t.includes("artesanato") ||
    t.includes("presente") ||
    t.includes("artes") ||
    t.includes("lembranc") ||
    t.includes("decor")
  ) {
    return "artesanato-presentes";
  }

  if (
    t.includes("vestuario") ||
    t.includes("roupa") ||
    t.includes("moda") ||
    t.includes("calcado") ||
    t.includes("acessorio") ||
    t.includes("costura")
  ) {
    return "moda-acessorios";
  }

  if (
    t.includes("pet") ||
    t.includes("veterin") ||
    t.includes("animal") ||
    t.includes("banho e tosa")
  ) {
    return "pet-cuidados";
  }

  if (
    t.includes("servico") ||
    t.includes("manutencao") ||
    t.includes("reparo") ||
    t.includes("eletric") ||
    t.includes("limpeza")
  ) {
    return "servicos-gerais";
  }

  return "";
}

/**
 * Consulta pública de CNPJ na BrasilAPI
 */
export async function fetchCnpjData(rawCnpj: string): Promise<CnpjData | null> {
  const clean = rawCnpj.replace(/\D/g, "");
  if (clean.length !== 14) return null;

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    // Nome fantasia preferencial, senão razão social formatada
    let preferredName = (data.nome_fantasia || "").trim();
    if (!preferredName || preferredName === "********") {
      preferredName = (data.razao_social || "")
        .replace(/\b(ME|MEI|LTDA|EPP|EIRELI)\b/gi, "")
        .replace(/\d{11,14}/g, "") // remove CPF ou CNPJ comum em MEI
        .trim();
    }

    // Capitalização amigável se estiver tudo em maiúsculo
    if (preferredName && preferredName === preferredName.toUpperCase()) {
      preferredName = preferredName
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (char: string) => char.toUpperCase());
    }

    return {
      cnpj: formatCnpj(clean),
      name: preferredName || (data.razao_social || "").trim(),
      legalName: data.razao_social || "",
      cep: data.cep ? data.cep.replace(/\D/g, "") : "",
      streetAddress: data.logradouro || "",
      addressNumber: data.numero || "",
      neighborhood: data.bairro || "",
      city: data.municipio || "",
      state: data.uf || "DF",
      phone: data.ddd_telefone_1 ? `55${data.ddd_telefone_1.replace(/\D/g, "")}` : undefined,
      cnaeCode: data.cnae_fiscal,
      cnaeDescription: data.cnae_fiscal_descricao,
    };
  } catch (err) {
    console.error("Erro ao consultar CNPJ:", err);
    return null;
  }
}
