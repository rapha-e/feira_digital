import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir Senha | Feira Digital",
  description: "Redefina sua senha de acesso ao painel do lojista da Feira Digital.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RedefinirSenhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
