import { NextRequest, NextResponse } from "next/server";
import {
  getActiveSponsors,
  getAllSponsorsAdmin,
  createSponsorAdmin,
  toggleSponsorActive,
  updateSponsorAdmin,
  deleteSponsorAdmin,
} from "@/lib/data";

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

    if (body.action === "update") {
      const ok = await updateSponsorAdmin(body.id, body.data);
      return NextResponse.json({ success: ok });
    }

    if (body.action === "delete") {
      const ok = await deleteSponsorAdmin(body.id);
      return NextResponse.json({ success: ok });
    }

    const ok = await createSponsorAdmin(body);
    return NextResponse.json({ success: ok });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro ao processar anúncio" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID não fornecido" }, { status: 400 });
    }
    const ok = await deleteSponsorAdmin(id);
    return NextResponse.json({ success: ok });
  } catch {
    return NextResponse.json({ success: false, error: "Erro ao excluir anúncio" }, { status: 500 });
  }
}

