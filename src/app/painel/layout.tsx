import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel do Empreendedor | Feira Digital",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
