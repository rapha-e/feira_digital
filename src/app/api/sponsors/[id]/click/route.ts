import { NextRequest, NextResponse } from "next/server";
import { recordSponsorClick, getAllSponsorsAdmin } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sponsors = await getAllSponsorsAdmin();
  const sponsor = sponsors.find(s => s.id === id);

  if (!sponsor || !sponsor.target_url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Registra o clique assincronamente sem travar a navegação
  recordSponsorClick(id).catch(err => console.error("Erro ao registrar clique de sponsor:", err));

  return NextResponse.redirect(sponsor.target_url);
}
