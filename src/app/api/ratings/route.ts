import { NextResponse } from "next/server";
import { getAllRatings, isDbConfigured } from "@/lib/db";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ configured: false, ratings: {} });
  }
  try {
    const ratings = await getAllRatings();
    return NextResponse.json({ configured: true, ratings });
  } catch (err) {
    console.error("GET /api/ratings failed:", err);
    return NextResponse.json({ configured: false, ratings: {} }, { status: 500 });
  }
}
