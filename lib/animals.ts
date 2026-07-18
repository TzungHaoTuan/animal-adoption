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
  animal_bacterin: z.string().catch(""),
  animal_title: z.string().catch(""),
  animal_subid: z.string().catch(""),
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
  sex?: string;
  age?: string;
  bodytype?: string;
  sterilization?: string;
  bacterin?: string;
  shelter?: string;
};

const FILTER_KEYS = [
  "kind",
  "sex",
  "age",
  "bodytype",
  "sterilization",
  "bacterin",
  "shelter",
] as const;

/** Single source of truth for the filter query-param keys, shared by the API route and client fetches. */
export function filtersFromSearchParams(
  searchParams: URLSearchParams,
): AnimalFilters {
  const filters: AnimalFilters = {};
  for (const key of FILTER_KEYS) {
    const value = searchParams.get(key);
    if (value) filters[key] = value;
  }
  return filters;
}

export function filtersToSearchParams(filters: AnimalFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  return params;
}

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

// "未提供"(N) is treated as "否"(F) for sterilization/bacterin filtering —
// there's no meaningful UI reason to distinguish "not sterilized" from
// "unknown", so the F option matches both.
function matchesYesNoFilter(
  filterValue: string | undefined,
  fieldValue: string,
): boolean {
  if (!filterValue) return true;
  return filterValue === "T" ? fieldValue === "T" : fieldValue !== "T";
}

function matchesFilters(animal: Animal, filters: AnimalFilters): boolean {
  if (filters.kind && animal.animal_kind !== filters.kind) return false;
  if (filters.sex && animal.animal_sex !== filters.sex) return false;
  if (filters.age && animal.animal_age !== filters.age) return false;
  if (filters.bodytype && animal.animal_bodytype !== filters.bodytype)
    return false;
  if (!matchesYesNoFilter(filters.sterilization, animal.animal_sterilization))
    return false;
  if (!matchesYesNoFilter(filters.bacterin, animal.animal_bacterin))
    return false;
  if (filters.shelter && animal.shelter_name !== filters.shelter) return false;
  return true;
}

export async function fetchAnimals(
  filters: AnimalFilters,
  { offset = 0, limit = 12 }: { offset?: number; limit?: number } = {},
): Promise<{ items: Animal[]; hasMore: boolean }> {
  const all = await fetchAllAnimalsRaw();
  const filtered = all.filter((animal) => matchesFilters(animal, filters));

  return {
    items: filtered.slice(offset, offset + limit),
    hasMore: offset + limit < filtered.length,
  };
}

const BODYTYPE_LABEL: Record<string, string> = {
  SMALL: "小型",
  MEDIUM: "中型",
  BIG: "大型",
};

const SEX_LABEL: Record<string, string> = {
  M: "男孩",
  F: "女孩",
};

const AGE_LABEL: Record<string, string> = {
  ADULT: "成年",
  CHILD: "幼年",
};

/** Only used for the detail-page title — list cards show real fields only, no fabricated names. */
export function getDisplayName(animal: Animal): string {
  if (animal.animal_title) return animal.animal_title;
  if (animal.animal_subid)
    return `${animal.animal_kind}・#${animal.animal_subid}`;
  return `${animal.animal_kind}・#${animal.animal_id}`;
}

export function getSummaryLine(animal: Animal): string {
  const sex = SEX_LABEL[animal.animal_sex] ?? animal.animal_sex;
  const size = BODYTYPE_LABEL[animal.animal_bodytype] ?? animal.animal_bodytype;
  const age = AGE_LABEL[animal.animal_age] ?? animal.animal_age;
  return `${animal.animal_kind}・${sex}・${size}・${age}`;
}

/** Options for the shelter filter dropdown — derived from the same cached dataset used for filtering, so names always match exactly. */
export async function fetchShelterNames(): Promise<string[]> {
  const all = await fetchAllAnimalsRaw();
  return Array.from(
    new Set(all.map((a) => a.shelter_name).filter(Boolean)),
  ).sort();
}

export async function fetchAnimalDetail(
  id: number,
): Promise<{ animal: Animal; recommendations: Animal[] } | null> {
  const all = await fetchAllAnimalsRaw();
  const animal = all.find((a) => a.animal_id === id);
  if (!animal) return null;

  const recommendations = all
    .filter(
      (a) =>
        a.animal_id !== id &&
        a.animal_kind === animal.animal_kind &&
        a.animal_colour === animal.animal_colour,
    )
    .slice(0, 3);

  return { animal, recommendations };
}
