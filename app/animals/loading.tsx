import { SiteHeader } from "@/components/site-header";
import { FilterBarSkeleton } from "@/components/filter-bar-skeleton";
import { AnimalGridSkeleton } from "@/components/animal-grid-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-50">
        <div className="bg-background">
          <SiteHeader />
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-0">
            <FilterBarSkeleton />
          </div>
        </div>
        <div className="h-6 bg-linear-to-b from-background to-transparent" />
      </div>
      <div className="mx-auto px-4 flex w-full max-w-6xl flex-1 flex-col gap-6 pb-20">
        <AnimalGridSkeleton />
      </div>
    </div>
  );
}
