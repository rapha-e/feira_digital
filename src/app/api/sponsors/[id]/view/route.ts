import { NextRequest, NextResponse } from "next/server";
import { recordSponsorView } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  recordSponsorView(id).catch(() => {});
  return NextResponse.json({ success: true });
}
