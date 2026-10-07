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
 * RF03: Algoritmo de Busca e Ordenação por Proximidade com Fallback Regional Progressivo
 */
export function sortBusinessesByProximity(
  businesses: BusinessWithProducts[],
  userLocation?: UserLocation | null
): BusinessWithProducts[] {
  if (!userLocation) {
    // Sem localização, prioriza os empreendedores destacados patrocinados
    return [...businesses].sort((a, b) => {
      const aFeatured = a.is_featured ? 1 : 0;
      const bFeatured = b.is_featured ? 1 : 0;
      return bFeatured - aFeatured;
    });
  }

  const userLat = userLocation.lat;
  const userLng = userLocation.lng;
  const userNeighborhood = userLocation.neighborhood?.toLowerCase().trim();
  const userCity = userLocation.city?.toLowerCase().trim();

  // Caso 1: Usuário possui coordenadas válidas (GPS ou CEP)
  if (userLat !== undefined && userLng !== undefined) {
    const withDistance = businesses.map(b => {
      if (b.latitude && b.longitude) {
        const dist = calculateDistanceKm(userLat, userLng, b.latitude, b.longitude);
        return { ...b, distance_km: dist };
      }
      // Se a loja não tem coordenadas salvas mas tem o mesmo bairro
      if (userNeighborhood && b.neighborhood.toLowerCase().trim() === userNeighborhood) {
        return { ...b, distance_km: 1.0 }; // Aproximação de 1km para mesmo bairro
      }
      if (userCity && b.city.toLowerCase().trim() === userCity) {
        return { ...b, distance_km: 10.0 }; // Aproximação de 10km para mesma cidade
      }
      return { ...b, distance_km: 999.0 };
    });

    // Ordenação Híbrida: Destaques Patrocinados Primeiro -> Distância mais próxima -> Restante
    return withDistance.sort((a, b) => {
      const aFeatured = a.is_featured ? 1 : 0;
      const bFeatured = b.is_featured ? 1 : 0;
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured;
      }
      return (a.distance_km ?? 999) - (b.distance_km ?? 999);
    });
  }

  // Caso 2: Usuário informou apenas Bairro/Cidade manualmente
  if (userNeighborhood || userCity) {
    return [...businesses].sort((a, b) => {
      const aFeatured = a.is_featured ? 1 : 0;
      const bFeatured = b.is_featured ? 1 : 0;
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured;
      }

      const aNeighborhoodMatch =
        userNeighborhood && a.neighborhood.toLowerCase().trim() === userNeighborhood ? 1 : 0;
      const bNeighborhoodMatch =
        userNeighborhood && b.neighborhood.toLowerCase().trim() === userNeighborhood ? 1 : 0;

      if (aNeighborhoodMatch !== bNeighborhoodMatch) {
        return bNeighborhoodMatch - aNeighborhoodMatch;
      }

      const aCityMatch = userCity && a.city.toLowerCase().trim() === userCity ? 1 : 0;
      const bCityMatch = userCity && b.city.toLowerCase().trim() === userCity ? 1 : 0;

      return bCityMatch - aCityMatch;
    });
  }

  return [...businesses].sort((a, b) => {
    const aFeatured = a.is_featured ? 1 : 0;
    const bFeatured = b.is_featured ? 1 : 0;
    return bFeatured - aFeatured;
  });
}
