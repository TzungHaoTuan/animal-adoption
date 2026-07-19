import { z } from "zod";

const shelterSchema = z.object({
  ID: z.string().catch(""),
  ShelterName: z.string().catch(""),
  CityName: z.string().catch(""),
  Address: z.string().catch(""),
  Phone: z.string().catch(""),
  OpenTime: z.string().catch(""),
  Lat: z.coerce.number(),
  Lon: z.coerce.number(),
});

export type Shelter = z.infer<typeof shelterSchema>;

/** Fixed 33-record registry (has lat/lng already, unlike AnimalRecognition's shelter_name) — no pagination, no local offset/limit needed. */
export async function fetchShelters(): Promise<Shelter[]> {
  const res = await fetch(
    "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=2thVboChxuKs",
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(`Shelter registry API responded ${res.status}`);
  }

  const raw = await res.json();
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => shelterSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .filter((shelter) => Number.isFinite(shelter.Lat) && Number.isFinite(shelter.Lon));
}
