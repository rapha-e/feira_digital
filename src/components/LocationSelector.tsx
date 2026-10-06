"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Check,
  Loader2,
  Sparkles,
  Compass,
} from "lucide-react";
import {
  UserLocation,
  fetchAddressByCep,
  reverseGeocode,
} from "@/lib/geo";

export function LocationSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepInput, setCepInput] = useState("");
  const [manualNeighborhood, setManualNeighborhood] = useState("");
  const [manualCity, setManualCity] = useState("Brasília");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Carrega localização salva no localStorage ao iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("feira_user_location");
      if (saved) {
        const parsed = JSON.parse(saved) as UserLocation;
        setUserLocation(parsed);
      }
    } catch {
      // Ignora erro de storage
    }
  }, []);

  const saveAndApplyLocation = (loc: UserLocation | null) => {
    if (loc) {
      localStorage.setItem("feira_user_location", JSON.stringify(loc));
      setUserLocation(loc);

      // Atualiza URL com query params se estiver na home para filtrar/ordenar
      const params = new URLSearchParams(searchParams.toString());
      if (loc.lat !== undefined && loc.lng !== undefined) {
        params.set("lat", loc.lat.toString());
        params.set("lng", loc.lng.toString());
      } else {
        params.delete("lat");
        params.delete("lng");
      }

      if (loc.neighborhood) {
        params.set("bairro", loc.neighborhood);
      }

      router.push(`/?${params.toString()}`);
      window.dispatchEvent(new CustomEvent("feira_location_changed", { detail: loc }));
    } else {
      localStorage.removeItem("feira_user_location");
      setUserLocation(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("lat");
      params.delete("lng");
      params.delete("bairro");
      router.push(`/?${params.toString()}`);
      window.dispatchEvent(new CustomEvent("feira_location_changed", { detail: null }));
    }
    setIsOpen(false);
  };

  // RF01: Captura por GPS do Navegador
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setFeedbackMsg({
        type: "error",
        text: "Geolocalização não é suportada pelo seu navegador.",
      });
      return;
    }

    setLoadingGps(true);
    setFeedbackMsg(null);

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const rev = await reverseGeocode(lat, lng);
          const neighborhood = rev?.neighborhood || "";
          const city = rev?.city || "Brasília";
          const label = neighborhood ? `${neighborhood}, ${city}` : `Coordenadas (${lat.toFixed(2)}, ${lng.toFixed(2)})`;

          const loc: UserLocation = {
            lat,
            lng,
            neighborhood,
            city,
            state: rev?.state || "DF",
            label,
            source: "gps",
          };

          saveAndApplyLocation(loc);
        } catch {
          const loc: UserLocation = {
            lat,
            lng,
            label: "Localização GPS",
            source: "gps",
          };
          saveAndApplyLocation(loc);
        } finally {
          setLoadingGps(false);
        }
      },
      error => {
        setLoadingGps(false);
        let msg = "Não foi possível obter a sua localização.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Permissão de GPS negada. Você pode digitar seu CEP ou Bairro abaixo.";
        }
        setFeedbackMsg({ type: "error", text: msg });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // RF01: Fallback Manual via CEP
  const handleSearchCep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepInput.trim()) return;

    setLoadingCep(true);
    setFeedbackMsg(null);

    try {
      const addr = await fetchAddressByCep(cepInput);
      if (addr) {
        const label = addr.neighborhood
          ? `${addr.neighborhood}, ${addr.city}`
          : `${addr.city} - ${addr.state}`;

        const loc: UserLocation = {
          lat: addr.lat,
          lng: addr.lng,
          neighborhood: addr.neighborhood,
          city: addr.city,
          state: addr.state,
          label,
          source: "cep",
        };

        saveAndApplyLocation(loc);
      } else {
        setFeedbackMsg({
          type: "error",
          text: "CEP não encontrado. Verifique o número digitado.",
        });
      }
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "Erro ao consultar CEP. Tente novamente.",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  // RF01: Fallback Manual por Bairro/Cidade
  const handleManualNeighborhood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNeighborhood.trim()) return;

    const loc: UserLocation = {
      neighborhood: manualNeighborhood.trim(),
      city: manualCity.trim(),
      label: `${manualNeighborhood.trim()}, ${manualCity.trim()}`,
      source: "manual",
    };

    saveAndApplyLocation(loc);
  };

  const handleClearLocation = () => {
    saveAndApplyLocation(null);
  };

  return (
    <>
      {/* Botão no Header (RF04) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs max-w-[150px] sm:max-w-[220px]"
        title="Alterar sua localização para ver ofertas próximas"
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="truncate">
          {userLocation ? userLocation.label || "Perto de mim" : "Onde você está?"}
        </span>
      </button>

      {/* Modal de Localização */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <span>Sua Localização</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Priorize os MEIs e produtos mais próximos da sua vizinhança.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensagem de Feedback */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  feedbackMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            {/* Opção 1: GPS Automático */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 block">
                Localização Rápida por GPS
              </span>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={loadingGps}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                {loadingGps ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 fill-white" />
                )}
                <span>{loadingGps ? "Detectando satélite..." : "Usar meu GPS atual"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                ou informe manualmente
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Opção 2: Busca por CEP */}
            <form onSubmit={handleSearchCep} className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Buscar pelo seu CEP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={9}
                  value={cepInput}
                  onChange={e => setCepInput(e.target.value)}
                  placeholder="Ex: 70040-010"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={loadingCep || !cepInput.trim()}
                  className="py-2 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {loadingCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Buscar</span>
                </button>
              </div>
            </form>

            {/* Opção 3: Digitar Bairro / Cidade */}
            <form onSubmit={handleManualNeighborhood} className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Ou digite seu Bairro e Cidade
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={manualNeighborhood}
                  onChange={e => setManualNeighborhood(e.target.value)}
                  placeholder="Ex: Asa Norte"
                  className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="text"
                  value={manualCity}
                  onChange={e => setManualCity(e.target.value)}
                  placeholder="Cidade (ex: Brasília)"
                  className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={!manualNeighborhood.trim()}
                className="w-full py-2 px-3.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-50 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Aplicar Bairro
              </button>
            </form>

            {/* Localização Ativa & Botão Limpar */}
            {userLocation && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-600 truncate">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Ativa: <strong>{userLocation.label}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="text-stone-400 hover:text-red-600 font-medium underline cursor-pointer text-[11px]"
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
