import {
  fetchAnimals,
  fetchShelterNames,
  type Animal,
  type AnimalFilters,
} from "@/lib/animals";
import { AnimalGrid } from "@/components/animal-grid";
import { FilterBar } from "@/components/filter-bar";
import { SiteHeader } from "@/components/site-header";

const INITIAL_BATCH = 12; // ponytail: fixed guess aligned to xl:grid-cols-4 x 3 rows, SSR can't know real viewport

type SearchParams = { [key: string]: string | string[] | undefined };

function toFilterValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AnimalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters: AnimalFilters = {
    kind: toFilterValue(params.kind),
    sex: toFilterValue(params.sex),
    age: toFilterValue(params.age),
    bodytype: toFilterValue(params.bodytype),
    sterilization: toFilterValue(params.sterilization),
    bacterin: toFilterValue(params.bacterin),
    shelter: toFilterValue(params.shelter),
  };

  let items: Animal[] = [];
  let hasMore = false;
  let fetchFailed = false;
  let shelterNames: string[] = [];
  try {
    [{ items, hasMore }, shelterNames] = await Promise.all([
      fetchAnimals(filters, { limit: INITIAL_BATCH }),
      fetchShelterNames(),
    ]);
  } catch {
    fetchFailed = true;
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader active />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <FilterBar currentFilters={filters} shelterNames={shelterNames} />
        <p className="text-sm text-muted-foreground">
          串接農業部認領養開放資料，資料每日更新。
        </p>

        {fetchFailed ? (
          <p className="py-16 text-center text-muted-foreground">
            資料讀取失敗，請稍後再試一次。
          </p>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            目前沒有符合篩選條件的動物，換個條件試試看。
          </p>
        ) : (
          <>
            <AnimalGrid
              key={JSON.stringify(filters)}
              initialAnimals={items}
              initialHasMore={hasMore}
              filters={filters}
            />
            <p className="text-center text-xs text-muted-foreground">
              資料每日更新，若動物已被認養將自動從清單移除
            </p>
          </>
        )}
      </div>
    </div>
  );
}
