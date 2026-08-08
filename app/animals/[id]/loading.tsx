import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";

const INFO_ROWS = 6; // matches InfoCard's rows in app/animals/[id]/page.tsx
const RECOMMENDATION_COUNT = 6; // matches fetchAnimalDetail's recommendation cap

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <div className="flex flex-col justify-between flex-1 mx-auto w-full max-w-6xl gap-8 px-4 pt-6 pb-16 sm:px-6">
        <div className="w-full flex flex-col flex-1 lg:flex-row items-stretch gap-4">
          <div className="min-h-90 flex-1 animate-pulse rounded-3xl bg-muted border-6 border-primary" />

          <div className="flex flex-col gap-4 w-full max-w-120">
            <div className="flex items-start justify-between">
              <div className="h-7 w-28 animate-pulse rounded-full bg-card" />
              <div className="size-6.5 shrink-0 animate-pulse rounded-full bg-card" />
            </div>

            <Card className="gap-3.5 p-5 flex-1">
              <div className="h-7 w-16 animate-pulse rounded-full bg-background" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {Array.from({ length: INFO_ROWS }).map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="h-4 w-10 animate-pulse rounded-full bg-background" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-background" />
                  </div>
                ))}
              </div>
              <div className="h-full animate-pulse rounded-xl bg-accent/50" />
            </Card>

            <Card className="gap-3.5 p-5">
              <div className="flex flex-col gap-1">
                <div className="h-5 w-32 animate-pulse rounded-full bg-background" />
                <div className="h-5 w-48 animate-pulse rounded-full bg-background" />
                <div className="h-5 w-24 animate-pulse rounded-full bg-background" />
              </div>
              <div className="h-10 w-40 animate-pulse rounded-full border border-transparent bg-accent" />
            </Card>
          </div>
        </div>

        <div>
          <div className="mb-3 h-7 w-28 animate-pulse rounded-full bg-card" />
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            {Array.from({ length: RECOMMENDATION_COUNT }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
