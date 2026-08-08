export function FilterBarSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-3xl bg-card p-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-9 w-full animate-pulse rounded-2xl bg-background sm:w-65" />
        <div className="hidden sm:block h-5.5 w-px bg-border" />
        <div className="h-9 w-full animate-pulse rounded-2xl bg-background sm:w-65" />
        <div className="hidden sm:block h-5.5 w-px bg-border" />
        <div className="h-9 w-28 animate-pulse rounded-2xl bg-background" />
      </div>
    </div>
  );
}
