import { Suspense } from "react";
import {
  fetchAnimals,
  fetchShelterNames,
  type Animal,
  type AnimalFilters,
} from "@/lib/animals";
import { AnimalGrid } from "@/components/animal-grid";
import { AnimalGridPending } from "@/components/animal-grid-pending";
import { AnimalGridSkeleton } from "@/components/animal-grid-skeleton";
import { FilterBar } from "@/components/filter-bar";
import { FilterBarSkeleton } from "@/components/filter-bar-skeleton";
import { FilterTransitionProvider } from "@/components/filter-transition";
import { SiteHeader } from "@/components/site-header";

const INITIAL_BATCH = 12; // ponytail: fixed guess aligned to xl:grid-cols-4 x 3 rows, SSR can't know real viewport

type SearchParams = { [key: string]: string | string[] | undefined };

function toFilterValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

async function FilterBarSection({ filters }: { filters: AnimalFilters }) {
  let shelterNames: string[] = [];
  try {
    shelterNames = await fetchShelterNames();
  } catch {
    // degrade gracefully: filter bar still renders, just without shelter options
  }
  return <FilterBar currentFilters={filters} shelterNames={shelterNames} />;
}

async function AnimalGridSection({ filters }: { filters: AnimalFilters }) {
  let items: Animal[] = [];
  let hasMore = false;
  let fetchFailed = false;
  try {
    ({ items, hasMore } = await fetchAnimals(filters, {
      limit: INITIAL_BATCH,
    }));
  } catch {
    fetchFailed = true;
  }

  if (fetchFailed) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        資料讀取失敗，請稍後再試一次。
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        目前沒有符合篩選條件的動物，換個條件試試看。
      </p>
    );
  }
  return (
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
  );
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
    county: toFilterValue(params.county),
    shelter: toFilterValue(params.shelter),
  };

  return (
    <FilterTransitionProvider>
      <div className="flex flex-1 flex-col">
        <div className="sticky top-0 z-50">
          <div className="bg-background">
            <SiteHeader />
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-0">
              <Suspense fallback={<FilterBarSkeleton />}>
                <FilterBarSection filters={filters} />
              </Suspense>
            </div>
          </div>
          <div className="h-6 bg-linear-to-b from-background to-transparent" />
        </div>

        <div className="mx-auto px-4 flex w-full max-w-6xl flex-1 flex-col gap-6 pb-20">
          <AnimalGridPending>
            <Suspense fallback={<AnimalGridSkeleton />}>
              <AnimalGridSection filters={filters} />
            </Suspense>
          </AnimalGridPending>
        </div>
      </div>
    </FilterTransitionProvider>
  );
}
