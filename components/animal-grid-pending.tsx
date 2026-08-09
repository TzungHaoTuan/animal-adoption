"use client";

import type { ReactNode } from "react";
import { useFilterTransition } from "@/components/filter-transition";
import { AnimalGridSkeleton } from "@/components/animal-grid-skeleton";

export function AnimalGridPending({ children }: { children: ReactNode }) {
  const { isPending } = useFilterTransition();
  return (
    <div className="relative">
      <div
        className={
          isPending
            ? "opacity-40 pointer-events-none transition-opacity"
            : "transition-opacity"
        }
      >
        {children}
      </div>
      {isPending && (
        <div className="absolute inset-0 top-0">
          <AnimalGridSkeleton />
        </div>
      )}
    </div>
  );
}
