import { NextRequest, NextResponse } from "next/server";
import { getActiveSponsors, getAllSponsorsAdmin, createSponsorAdmin, toggleSponsorActive } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement") as "home" | "painel" | "all" | null;
  const admin = searchParams.get("admin") === "1";

  if (admin) {
    const all = await getAllSponsorsAdmin();
    return NextResponse.json(all);
  }

  const sponsors = await getActiveSponsors(placement || "home");
  return NextResponse.json(sponsors);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === "toggle") {
      const ok = await toggleSponsorActive(body.id, body.is_active);
      return NextResponse.json({ success: ok });
    }

    const ok = await createSponsorAdmin(body);
    return NextResponse.json({ success: ok });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro ao processar anúncio" }, { status: 500 });
  }
}
