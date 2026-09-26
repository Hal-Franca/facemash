import { NextResponse } from "next/server";
import { catalog } from "@/data";
import { isDbConfigured, recordVote } from "@/lib/db";

const IDS = new Set(catalog.map((c) => c.id));

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }
  let body: { winnerId?: string; loserId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { winnerId, loserId } = body;
  if (
    typeof winnerId !== "string" ||
    typeof loserId !== "string" ||
    winnerId === loserId ||
    !IDS.has(winnerId) ||
    !IDS.has(loserId)
  ) {
    return NextResponse.json({ error: "Invalid matchup" }, { status: 400 });
  }
  try {
    const ratings = await recordVote(winnerId, loserId);
    return NextResponse.json({ configured: true, ratings });
  } catch (err) {
    console.error("POST /api/vote failed:", err);
    return NextResponse.json({ error: "Vote failed" }, { status: 500 });
  }
}
