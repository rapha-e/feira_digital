import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { LgpdBanner } from "@/components/LgpdBanner";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://feira-digital-xi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Feira Digital | Vitrines e Produtos Locais direto no WhatsApp",
    template: "%s | Feira Digital",
  },
  description:
    "Encontre produtos e serviços de microempreendedores e MEIs do seu bairro no Distrito Federal e faça pedidos diretamente pelo WhatsApp sem taxas.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "Feira Digital",
    title: "Feira Digital | Vitrines e Produtos Locais direto no WhatsApp",
    description:
      "Conexão direta com pequenos negócios, artesãos e MEIs de Brasília e regiões do DF. Consulte produtos e feche pedidos no WhatsApp.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "url": baseUrl,
      "name": "Feira Digital",
      "description": "Catálogo comunitário de microempreendedores e MEIs do Distrito Federal.",
      "inLanguage": "pt-BR"
    },
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "Feira Digital",
      "url": baseUrl,
      "logo": `${baseUrl}/favicon.ico`,
      "areaServed": "Distrito Federal, Brasil"
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <AnalyticsScripts />
        <LgpdBanner />
      </body>
    </html>
  );
}

