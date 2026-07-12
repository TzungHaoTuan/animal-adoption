import { NextRequest, NextResponse } from "next/server";
import { fetchAnimals } from "@/lib/animals";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "12");

  try {
    const { items, hasMore } = await fetchAnimals(
      {
        kind: searchParams.get("kind") ?? undefined,
        bodytype: searchParams.get("bodytype") ?? undefined,
        sex: searchParams.get("sex") ?? undefined,
        sterilization: searchParams.get("sterilization") ?? undefined,
      },
      { offset, limit }
    );

    return NextResponse.json({ data: items, hasMore });
  } catch {
    return NextResponse.json({ error: "Failed to fetch animals" }, { status: 502 });
  }
}
