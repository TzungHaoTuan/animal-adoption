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
    .map((result) => result.data);
}

export type AnimalFilters = {
  kind?: string;
  bodytype?: string;
  sex?: string;
  sterilization?: string;
};

export async function fetchAnimals(
  filters: AnimalFilters,
  { top = 20, page = 1 }: { top?: number; page?: number } = {}
): Promise<Animal[]> {
  const apiUrl = new URL("https://data.moa.gov.tw/api/v1/AnimalRecognition/");
  apiUrl.searchParams.set("$top", String(top));
  apiUrl.searchParams.set("Page", String(page));
  if (filters.kind) apiUrl.searchParams.set("animal_kind", filters.kind);
  if (filters.bodytype) apiUrl.searchParams.set("animal_bodytype", filters.bodytype);
  if (filters.sex) apiUrl.searchParams.set("animal_sex", filters.sex);
  if (filters.sterilization)
    apiUrl.searchParams.set("animal_sterilization", filters.sterilization);

  const res = await fetch(apiUrl.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`MOA API responded ${res.status}`);
  }

  return parseAnimalList(await res.json());
}
