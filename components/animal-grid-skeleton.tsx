const DEFAULT_COUNT = 12; // ponytail: match INITIAL_BATCH in page.tsx so the grid doesn't reflow on swap-in

export function AnimalGridSkeleton({ count = DEFAULT_COUNT }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="animate-pulse rounded-3xl bg-card p-2.5">
          <div className="aspect-square rounded-2xl bg-background" />
          <div className="mt-3.5 h-5 w-2/3 rounded-full bg-background" />
          <div className="mt-2 h-4 w-1/2 rounded-full bg-background" />
        </li>
      ))}
    </ul>
  );
}
