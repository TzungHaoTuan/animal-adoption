import { z } from "zod";

const animalSchema = z.object({
  animal_id: z.coerce.number(),
  animal_kind: z.string().catch(""),
  animal_sex: z.string().catch(""),
  animal_bodytype: z.string().catch(""),
  animal_colour: z.string().catch(""),
  animal_age: z.string().catch(""),
  animal_sterilization: z.string().catch(""),
  animal_place: z.string().catch(""),
  animal_remark: z.string().catch(""),
  animal_status: z.string().catch(""),
  shelter_name: z.string().catch(""),
  shelter_address: z.string().catch(""),
  shelter_tel: z.string().catch(""),
  album_file: z.string().catch(""),
});

export type Animal = z.infer<typeof animalSchema>;

const listEnvelopeSchema = z.object({
  Data: z.array(z.unknown()),
});

/** Drops individual malformed records instead of failing the whole list. */
export function parseAnimalList(raw: unknown): Animal[] {
  const envelope = listEnvelopeSchema.safeParse(raw);
  if (!envelope.success) return [];

  return envelope.data.Data.map((item) => animalSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .filter((animal) => animal.album_file !== ""); // ponytail: no-photo listings dropped for now, revisit priority later
}

export type AnimalFilters = {
  kind?: string;
  bodytype?: string;
  sex?: string;
  sterilization?: string;
};

// ponytail: anonymous MOA access refuses Page>1 ("非會員只限回傳第一頁資料")
// and $top caps at 1000, so 1000 is the real ceiling of reachable data —
// fetch it once (cached) and filter/paginate locally instead of asking
// upstream for pages it won't give. Upgrade when a member API key exists.
const MAX_FETCHABLE = 1000;

async function fetchAllAnimalsRaw(): Promise<Animal[]> {
  const apiUrl = new URL("https://data.moa.gov.tw/api/v1/AnimalRecognition/");
  apiUrl.searchParams.set("$top", String(MAX_FETCHABLE));
  apiUrl.searchParams.set("Page", "1");

  const res = await fetch(apiUrl.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`MOA API responded ${res.status}`);
  }

  return parseAnimalList(await res.json());
}

function matchesFilters(animal: Animal, filters: AnimalFilters): boolean {
  if (filters.kind && animal.animal_kind !== filters.kind) return false;
  if (filters.bodytype && animal.animal_bodytype !== filters.bodytype) return false;
  if (filters.sex && animal.animal_sex !== filters.sex) return false;
  if (filters.sterilization && animal.animal_sterilization !== filters.sterilization)
    return false;
  return true;
}

export async function fetchAnimals(
  filters: AnimalFilters,
  { offset = 0, limit = 12 }: { offset?: number; limit?: number } = {}
): Promise<{ items: Animal[]; hasMore: boolean }> {
  const all = await fetchAllAnimalsRaw();
  const filtered = all.filter((animal) => matchesFilters(animal, filters));

  return {
    items: filtered.slice(offset, offset + limit),
    hasMore: offset + limit < filtered.length,
  };
}
