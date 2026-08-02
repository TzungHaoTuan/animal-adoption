"use client";

import { useEffect, useRef, useState } from "react";
import { AnimalCard } from "@/components/animal-card";
import {
  filtersToSearchParams,
  type Animal,
  type AnimalFilters,
} from "@/lib/animals";

const BATCH_SIZE = 12;

export function AnimalGrid({
  initialAnimals,
  initialHasMore,
  filters,
}: {
  initialAnimals: Animal[];
  initialHasMore: boolean;
  filters: AnimalFilters;
}) {
  const [animals, setAnimals] = useState(initialAnimals);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const offsetRef = useRef(initialAnimals.length);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);

    const params = filtersToSearchParams(filters);
    params.set("offset", String(offsetRef.current));
    params.set("limit", String(BATCH_SIZE));

    try {
      const res = await fetch(`/api/animals?${params.toString()}`);
      if (!res.ok) throw new Error(`API responded ${res.status}`);
      const json: { data: Animal[]; hasMore: boolean } = await res.json();

      offsetRef.current += json.data.length;
      hasMoreRef.current = json.hasMore;
      setAnimals((prev) => [...prev, ...json.data]);
      setHasMore(json.hasMore);
    } catch {
      // ponytail: leave hasMoreRef untouched so scrolling away and back retries
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadMore reads state via refs, no re-subscribe needed
  }, []);

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6 ">
        {animals.map((animal, index) => (
          <li key={animal.animal_id}>
            <AnimalCard animal={animal} preload={index < 4} />
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} className="h-1" />
      {loading ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          載入中…
        </p>
      ) : null}
      {error ? (
        <button
          type="button"
          onClick={loadMore}
          className="w-full py-4 text-center text-sm text-muted-foreground underline"
        >
          載入更多動物失敗，點此再試一次
        </button>
      ) : null}
      {!hasMore ? (
        <p className="mt-auto text-center text-sm text-muted-foreground">
          已顯示全部符合條件的動物
        </p>
      ) : null}
    </>
  );
}
