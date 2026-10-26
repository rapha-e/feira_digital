import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ShieldCheck, ArrowLeft, Lock, Eye, Database, Bell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade & Proteção de Dados (LGPD) | Feira Digital",
  description:
    "Transparência total sobre como seus dados são tratados na Feira Digital, em conformidade com a LGPD (Lei nº 13.709/2018).",
  alternates: {
    canonical: "/privacidade",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Feira Digital</span>
        </Link>

        <header className="space-y-3 border-b border-stone-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Conformidade com a LGPD (Lei 13.709/2018)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Última atualização: Outubro de 2026 • Versão 2.0
          </p>
        </header>

        <div className="prose prose-stone max-w-none space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span>1. Nosso Compromisso com a sua Privacidade</span>
            </h2>
            <p>
              A <strong>Feira Digital</strong> foi projetada com a privacidade como pilar central (<em>Privacy by Design</em>). Nosso propósito é conectar consumidores a microempreendedores (MEIs) e artesãos do Distrito Federal de forma direta, sem cobrança de taxas de intermediação e sem a venda ou compartilhamento indevido de seus dados pessoais com terceiros para fins publicitários.
            </p>
          </section>

          <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>2. Dados Coletados e Finalidade</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Geolocalização (Opcional):</strong> Utilizada estritamente para ordenar as lojas e produtos mais próximos da sua região (ex: Gama, Taguatinga, Águas Claras). Não armazenamos o histórico de seus deslocamentos. Caso prefira não usar GPS, você pode simplesmente selecionar ou digitar o seu bairro.
              </li>
              <li>
                <strong>Armazenamento Local (Local Storage e Cookies Técnicos):</strong> Usamos pequenas informações gravadas no seu próprio navegador para lembrar da sua região preferida e não exibir repetidamente avisos de cookies já aceitos.
              </li>
              <li>
                <strong>Dados de Cadastro de Empreendedores (MEIs):</strong> Nome comercial, bairro, cidade, WhatsApp de atendimento e fotos de produtos são exibidos publicamente na vitrine para possibilitar o contato com os clientes.
              </li>
              <li>
                <strong>Mensagens no WhatsApp:</strong> O fechamento do pedido ocorre diretamente na conversa privada do WhatsApp entre consumidor e vendedor (conexão ponto a ponto). A Feira Digital não tem acesso a pagamentos por cartão, conversas íntimas ou comprovantes trocados no aplicativo de mensagens.
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>3. Segurança da Informação</span>
            </h2>
            <p>
              Toda a comunicação com a nossa plataforma é criptografada utilizando o protocolo seguro HTTPS (TLS/SSL). O banco de dados do Supabase adota políticas rigorosas de Row-Level Security (RLS), garantindo que apenas usuários autenticados possam alterar informações de suas respectivas vitrines.
            </p>
          </section>

          <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span>4. Direitos do Titular (Artigo 18 da LGPD)</span>
            </h2>
            <p>
              Você, como titular de dados pessoais, tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Confirmação da existência de tratamento e acesso aos dados cadastrados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Eliminação ou exclusão completa de sua vitrine e produtos de nossa base;</li>
              <li>Revogação do consentimento a qualquer instante.</li>
            </ul>
            <p className="pt-2">
              Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato com nosso canal de suporte em:{" "}
              <a href="mailto:privacidade@feiradigital.com" className="text-emerald-700 underline font-semibold">
                privacidade@feiradigital.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Feira Digital - Todos os direitos reservados</span>
          <div className="flex items-center gap-4">
            <Link href="/termos" className="hover:text-stone-900 transition-colors">Termos de Uso</Link>
            <Link href="/" className="hover:text-stone-900 transition-colors">Página Inicial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
