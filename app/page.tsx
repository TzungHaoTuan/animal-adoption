import { fetchAnimals, type AnimalFilters } from "@/lib/animals";
import { AnimalCard } from "@/components/animal-card";
import { FilterBar } from "@/components/filter-bar";

type SearchParams = { [key: string]: string | string[] | undefined };

function toFilterValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters: AnimalFilters = {
    kind: toFilterValue(params.kind),
    bodytype: toFilterValue(params.bodytype),
    sex: toFilterValue(params.sex),
    sterilization: toFilterValue(params.sterilization),
  };

  const animals = await fetchAnimals(filters, { top: 24 });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          動物認領養
        </h1>
        <p className="text-sm text-muted-foreground">
          資料每日更新，動物一旦被領養會直接從清單消失。
        </p>
      </header>

      <FilterBar currentFilters={filters} />

      {animals.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          目前沒有符合篩選條件的動物，換個條件試試看。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {animals.map((animal) => (
            <li key={animal.animal_id}>
              <AnimalCard animal={animal} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
