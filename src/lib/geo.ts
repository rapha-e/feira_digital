/**
 * Utilitários de Geolocalização e Cálculo de Proximidade (PRD - Geolocalização de MEIs)
 */

import { BusinessWithProducts } from "@/types";

export interface UserLocation {
  lat?: number;
  lng?: number;
  neighborhood?: string;
  city?: string;
  state?: string;
  label?: string;
  source?: "gps" | "cep" | "manual";
}

/**
 * Fórmula de Haversine para cálculo de distância em quilômetros entre duas coordenadas
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio médio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Retorna com 1 casa decimal
}

/**
 * Formata a distância para exibição amigável no selo do card (RF04)
 */
export function formatDistance(distanceKm: number | null | undefined): string | null {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return null;
  }
  if (distanceKm <= 0.1) {
    return "No seu bairro";
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

/**
 * Consulta de CEP via BrasilAPI com fallback ViaCEP e obtenção de coordenadas
 */
export async function fetchAddressByCep(cepInput: string): Promise<{
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  lat?: number;
  lng?: number;
} | null> {
  const cleanCep = cepInput.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  try {
    // 1. Tenta BrasilAPI v2 (que já pode trazer coordinates)
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
    if (res.ok) {
      const data = await res.json();
      let lat = data.location?.coordinates?.latitude
        ? parseFloat(data.location.coordinates.latitude)
        : undefined;
      let lng = data.location?.coordinates?.longitude
        ? parseFloat(data.location.coordinates.longitude)
        : undefined;

      // Se BrasilAPI não trouxe coordenadas, busca por Nominatim
      if (!lat || !lng) {
        const geo = await geocodeAddress(data.street, data.neighborhood, data.city, data.state);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }
      }

      return {
        street: data.street || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
        cep: cleanCep,
        lat,
        lng,
      };
    }
  } catch {
    // Falha silenciosa e tenta ViaCEP
  }

  try {
    // 2. Fallback ViaCEP
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        let lat: number | undefined;
        let lng: number | undefined;

        const geo = await geocodeAddress(data.logradouro, data.bairro, data.localidade, data.uf);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }

        return {
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          cep: cleanCep,
          lat,
          lng,
        };
      }
    }
  } catch {
    // Ignora
  }

  return null;
}

/**
 * Geocodificação de endereço (obtém lat/lng a partir de texto)
 */
export async function geocodeAddress(
  street?: string,
  neighborhood?: string,
  city?: string,
  state?: string
): Promise<{ lat: number; lng: number } | null> {
  const parts = [street, neighborhood, city, state, "Brasil"].filter(Boolean).join(", ");
  if (!parts.trim()) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      parts
    )}&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "FeiraDigital-App/1.0",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    }
  } catch {
    // Ignora
  }

  return null;
}

/**
 * Geocodificação reversa (obtém bairro/cidade a partir de coordenadas GPS)
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ neighborhood?: string; city?: string; state?: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "FeiraDigital-App/1.0",
      },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const neighborhood =
        addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || "";
      const city = addr.city || addr.town || addr.municipality || addr.village || "";
      const state = addr.state || "";
      return { neighborhood, city, state };
    }
  } catch {
    // Ignora
  }
  return null;
}

/**
 * Mapeamento de Coordenadas Centrais das Regiões Administrativas do DF
 * Permite calcular distâncias precisas mesmo quando a busca for textual por Bairro/RA
 */
export const DF_REGIONS_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "gama": { lat: -16.0170, lng: -48.0670 },
  "santa maria": { lat: -16.0100, lng: -47.9900 },
  "samambaia": { lat: -15.8750, lng: -48.0900 },
  "recanto das emas": { lat: -15.9100, lng: -48.0700 },
  "riacho fundo": { lat: -15.8800, lng: -48.0100 },
  "riacho fundo i": { lat: -15.8800, lng: -48.0100 },
  "riacho fundo ii": { lat: -15.8950, lng: -48.0350 },
  "taguatinga": { lat: -15.8331, lng: -48.0567 },
  "taguatinga norte": { lat: -15.8270, lng: -48.0600 },
  "taguatinga sul": { lat: -15.8380, lng: -48.0520 },
  "taguatinga centro": { lat: -15.8331, lng: -48.0567 },
  "aguas claras": { lat: -15.8344, lng: -48.0267 },
  "águas claras": { lat: -15.8344, lng: -48.0267 },
  "vicente pires": { lat: -15.8050, lng: -48.0300 },
  "ceilandia": { lat: -15.8200, lng: -48.1100 },
  "ceilândia": { lat: -15.8200, lng: -48.1100 },
  "ceilandia norte": { lat: -15.8120, lng: -48.1150 },
  "ceilândia norte": { lat: -15.8120, lng: -48.1150 },
  "ceilandia sul": { lat: -15.8280, lng: -48.1050 },
  "ceilândia sul": { lat: -15.8280, lng: -48.1050 },
  "guara": { lat: -15.8200, lng: -47.9800 },
  "guará": { lat: -15.8200, lng: -47.9800 },
  "guara i": { lat: -15.8150, lng: -47.9780 },
  "guará i": { lat: -15.8150, lng: -47.9780 },
  "guara ii": { lat: -15.8250, lng: -47.9830 },
  "guará ii": { lat: -15.8250, lng: -47.9830 },
  "nucleo bandeirante": { lat: -15.8700, lng: -47.9600 },
  "núcleo bandeirante": { lat: -15.8700, lng: -47.9600 },
  "candangolandia": { lat: -15.8500, lng: -47.9500 },
  "candangolândia": { lat: -15.8500, lng: -47.9500 },
  "sudoeste": { lat: -15.7950, lng: -47.9250 },
  "octogonal": { lat: -15.7950, lng: -47.9250 },
  "cruzeiro": { lat: -15.7900, lng: -47.9350 },
  "cruzeiro novo": { lat: -15.7890, lng: -47.9370 },
  "cruzeiro velho": { lat: -15.7920, lng: -47.9330 },
  "asa sul": { lat: -15.8080, lng: -47.8990 },
  "asa norte": { lat: -15.7650, lng: -47.8830 },
  "plano piloto": { lat: -15.7939, lng: -47.8828 },
  "lago sul": { lat: -15.8400, lng: -47.8600 },
  "lago norte": { lat: -15.7300, lng: -47.8700 },
  "jardim botanico": { lat: -15.8700, lng: -47.8200 },
  "jardim botânico": { lat: -15.8700, lng: -47.8200 },
  "sao sebastiao": { lat: -15.8980, lng: -47.7680 },
  "são sebastião": { lat: -15.8980, lng: -47.7680 },
  "paranoa": { lat: -15.7700, lng: -47.7800 },
  "paranoá": { lat: -15.7700, lng: -47.7800 },
  "itapoa": { lat: -15.7480, lng: -47.7650 },
  "itapoã": { lat: -15.7480, lng: -47.7650 },
  "del lago": { lat: -15.7480, lng: -47.7650 },
  "del lago ii": { lat: -15.7480, lng: -47.7650 },
  "sobradinho": { lat: -15.6530, lng: -47.7890 },
  "sobradinho ii": { lat: -15.6300, lng: -47.8100 },
  "planaltina": { lat: -15.6170, lng: -47.6500 },
  "brazlandia": { lat: -15.6700, lng: -48.2000 },
  "brazlândia": { lat: -15.6700, lng: -48.2000 },
  "brasilia": { lat: -15.7939, lng: -47.8828 },
  "brasília": { lat: -15.7939, lng: -47.8828 },
};

function normalizeGeoText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function resolveDfRegionCoordinates(neighborhood?: string): { lat: number; lng: number } | null {
  if (!neighborhood) return null;
  const normalized = normalizeGeoText(neighborhood);

  if (DF_REGIONS_COORDINATES[normalized]) {
    return DF_REGIONS_COORDINATES[normalized];
  }

  // Busca por correspondência parcial
  for (const [key, coords] of Object.entries(DF_REGIONS_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  return null;
}

/**
 * RF03: Algoritmo de Proximidade Regional e Destaques
 * Ordem estrita solicitada:
 * 1º: Destaques da cidade/região selecionada (ordenados por menor distância)
 * 2º: Destaques das outras regiões (ordenados por menor distância)
 * 3º: Lojas sem destaque da região selecionada (ordenadas por menor distância)
 * 4º: Lojas sem destaque das outras regiões (ordenadas por menor distância)
 *
 * Em todos os 4 grupos, obedece sempre à geolocalização (Distância) do menor para o maior.
 */
export function sortBusinessesByProximity(
  businesses: BusinessWithProducts[],
  userLocation?: UserLocation | null
): BusinessWithProducts[] {
  if (!userLocation || (!userLocation.lat && !userLocation.lng && !userLocation.neighborhood)) {
    // Sem localização informada: destaca os patrocinados e depois ordem alfabética estável
    return [...businesses].sort((a, b) => {
      const aFeatured = a.is_featured ? 1 : 0;
      const bFeatured = b.is_featured ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  // 1. Resolver coordenadas do usuário (GPS, CEP ou inferido pelo Bairro/RA)
  let userLat = userLocation.lat;
  let userLng = userLocation.lng;
  const rawNeighborhood = userLocation.neighborhood?.trim() || "";
  // Pega o nome do bairro limpo (removendo cidade ou DF se houver, ex: "Paranoá, Brasília" -> "paranoa")
  const primaryUserNeighborhood = rawNeighborhood.split(",")[0].trim();
  const normUserNeighborhood = normalizeGeoText(primaryUserNeighborhood);

  if ((userLat === undefined || userLng === undefined) && primaryUserNeighborhood) {
    const resolvedCoords = resolveDfRegionCoordinates(primaryUserNeighborhood);
    if (resolvedCoords) {
      userLat = resolvedCoords.lat;
      userLng = resolvedCoords.lng;
    }
  }

  // 2. Calcular distância de cada estabelecimento
  const withDistance = businesses.map(b => {
    const rawBizNeighborhood = b.neighborhood || "";
    const primaryBizNeighborhood = rawBizNeighborhood.split(",")[0].trim();
    const normBizNeighborhood = normalizeGeoText(primaryBizNeighborhood);

    const isLocal = Boolean(
      normUserNeighborhood &&
        (normBizNeighborhood.includes(normUserNeighborhood) ||
          normUserNeighborhood.includes(normBizNeighborhood))
    );

    let calculatedDistance: number | null = null;

    if (userLat !== undefined && userLng !== undefined) {
      let bizLat = b.latitude;
      let bizLng = b.longitude;

      if ((bizLat === null || bizLat === undefined) && b.neighborhood) {
        const defaultBizCoords = resolveDfRegionCoordinates(b.neighborhood);
        if (defaultBizCoords) {
          bizLat = defaultBizCoords.lat;
          bizLng = defaultBizCoords.lng;
        }
      }

      if (bizLat !== null && bizLat !== undefined && bizLng !== null && bizLng !== undefined) {
        calculatedDistance = calculateDistanceKm(userLat, userLng, bizLat, bizLng);
        // Se for da mesma localidade e deu 0 (mesmas coordenadas de centro), define 0.3km
        if (isLocal && calculatedDistance === 0) {
          calculatedDistance = 0.3;
        }
      } else if (isLocal) {
        calculatedDistance = 0.3;
      }
    } else if (isLocal) {
      calculatedDistance = 0.3;
    }

    return {
      ...b,
      distance_km: calculatedDistance,
      _isLocalMatch: isLocal,
    };
  });

  // 3. Função de Classificação de Grupo:
  // Grupo 1: Destaque da cidade selecionada
  // Grupo 2: Destaque de outras regiões
  // Grupo 3: Sem destaque da cidade selecionada
  // Grupo 4: Sem destaque de outras regiões
  const getTier = (biz: { is_featured?: boolean; _isLocalMatch?: boolean }): number => {
    const isFeatured = Boolean(biz.is_featured);
    const isLocal = Boolean(biz._isLocalMatch);

    if (isFeatured && isLocal) return 1;
    if (isFeatured && !isLocal) return 2;
    if (!isFeatured && isLocal) return 3;
    return 4;
  };

  return withDistance.sort((a, b) => {
    const tierA = getTier(a);
    const tierB = getTier(b);

    if (tierA !== tierB) {
      return tierA - tierB;
    }

    // Dentro do mesmo grupo, sempre ordena do menor para o maior em distância
    const distA = a.distance_km ?? 999;
    const distB = b.distance_km ?? 999;

    if (distA !== distB) {
      return distA - distB;
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}


