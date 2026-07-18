import { NextRequest, NextResponse } from "next/server";
import { fetchAnimals, filtersFromSearchParams } from "@/lib/animals";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "12");

  try {
    const { items, hasMore } = await fetchAnimals(
      filtersFromSearchParams(searchParams),
      { offset, limit }
    );

    return NextResponse.json({ data: items, hasMore });
  } catch (err) {
    console.error("Failed to fetch animals:", err);
    return NextResponse.json({ error: "Failed to fetch animals" }, { status: 502 });
  }
}
