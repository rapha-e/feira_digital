"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedSlug = searchParams.get("invitedSlug");
  const invitedName = searchParams.get("invitedName");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">(
    invitedSlug ? "signup" : "signin"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    try {
      if (authMode === "forgot") {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://feira-digital-xi.vercel.app";
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/redefinir-senha`,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Link de recuperação enviado com sucesso! Verifique sua caixa de entrada e a pasta de spam.",
        });
      } else if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Conta criada com sucesso! Faça login abaixo para acessar o painel.",
        });
        setAuthMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const targetUrl = invitedSlug
          ? `/painel?invitedSlug=${encodeURIComponent(invitedSlug)}&invitedName=${encodeURIComponent(invitedName || "")}`
          : "/painel";

        router.push(targetUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({
        type: "error",
        text: error.message || "Ocorreu um erro no processamento.",
      });
    } finally {
      setLoading(false);
    }
  };

  const demoPanelUrl = invitedSlug
    ? `/painel?invitedSlug=${encodeURIComponent(invitedSlug)}&invitedName=${encodeURIComponent(invitedName || "")}`
    : "/painel";

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
      {/* Banner de Convite Ativo se houver */}
      {invitedSlug && authMode !== "forgot" && (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Criando vitrine para: <strong>{invitedName || invitedSlug}</strong>
          </span>
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
          {authMode === "forgot"
            ? "Recuperar sua Senha"
            : authMode === "signup"
            ? "Criar conta de Empreendedor"
            : "Acessar Painel do MEI"}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {authMode === "forgot"
            ? "Digite o e-mail cadastrado na sua loja para receber o link seguro de redefinição."
            : authMode === "signup"
            ? "Cadastre sua vitrine e receba pedidos no seu WhatsApp"
            : "Gerencie suas informações e catálogo de produtos"}
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            E-mail cadastrado
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
            />
          </div>
        </div>

        {authMode !== "forgot" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Senha
              </label>
              {authMode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot");
                    setMessage(null);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Esqueceu sua senha?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <span>
            {loading
              ? "Processando..."
              : authMode === "forgot"
              ? "Enviar Link de Recuperação"
              : authMode === "signup"
              ? "Cadastrar Negócio em 1 Minuto"
              : "Entrar no Painel"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-stone-100 space-y-3">
        {authMode === "forgot" ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setMessage(null);
              }}
              className="text-xs sm:text-sm text-stone-600 hover:text-emerald-700 font-semibold block mx-auto cursor-pointer"
            >
              ← Lembrou sua senha? Fazer login
            </button>
            <p className="text-[11px] text-stone-400">
              Não lembra qual e-mail usou? Entre em contato pelo WhatsApp do suporte da Feira Digital.
            </p>
          </div>
        ) : (
          <>
            {!isSupabaseConfigured() && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left">
                <span className="text-xs text-amber-800 block mb-2 leading-relaxed">
                  <strong>Supabase não configurado localmente:</strong> Você pode testar a experiência completa do painel agora mesmo em modo demo.
                </span>
                <Link
                  href={demoPanelUrl}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <span>Acessar Painel em Modo Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "signup" ? "signin" : "signup");
                setMessage(null);
              }}
              className="text-xs sm:text-sm text-stone-600 hover:text-emerald-600 font-medium block mx-auto cursor-pointer"
            >
              {authMode === "signup"
                ? "Já possui uma conta? Faça login aqui"
                : "Ainda não tem conta? Cadastre seu negócio gratuitamente"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center px-4 py-8">
      {/* Header Back Link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-stone-900 tracking-tight">
            Feira<span className="text-emerald-600">Digital</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-stone-500 hover:text-stone-800"
        >
          Voltar para Home
        </Link>
      </div>

      <Suspense fallback={<div className="w-full max-w-md h-96 bg-white rounded-3xl animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
