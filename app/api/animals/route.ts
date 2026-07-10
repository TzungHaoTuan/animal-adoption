import { NextRequest, NextResponse } from "next/server";
import { fetchAnimals } from "@/lib/animals";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const top = Number(searchParams.get("top") ?? "20");
  const page = Number(searchParams.get("page") ?? "1");

  try {
    const animals = await fetchAnimals(
      {
        kind: searchParams.get("kind") ?? undefined,
        bodytype: searchParams.get("bodytype") ?? undefined,
        sex: searchParams.get("sex") ?? undefined,
        sterilization: searchParams.get("sterilization") ?? undefined,
      },
      { top, page }
    );

    return NextResponse.json({ data: animals });
  } catch {
    return NextResponse.json({ error: "Failed to fetch animals" }, { status: 502 });
  }
}
