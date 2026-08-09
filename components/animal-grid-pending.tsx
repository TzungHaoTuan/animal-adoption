"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFilterTransition } from "@/components/filter-transition";
import { AnimalGridSkeleton } from "@/components/animal-grid-skeleton";

export function AnimalGridPending({ children }: { children: ReactNode }) {
  const { isPending } = useFilterTransition();
  return (
    <div className="relative">
      <div
        className={cn(
          "transition-opacity",
          isPending && "opacity-40 pointer-events-none",
        )}
      >
        {children}
      </div>
      {isPending && (
        <div className="absolute inset-0">
          <AnimalGridSkeleton />
        </div>
      )}
    </div>
  );
}
