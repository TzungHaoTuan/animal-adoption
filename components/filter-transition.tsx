"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";

const FilterTransitionContext = createContext<{
  isPending: boolean;
  startTransition: (action: () => void) => void;
} | null>(null);

export function FilterTransitionProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <FilterTransitionContext.Provider value={{ isPending, startTransition }}>
      {children}
    </FilterTransitionContext.Provider>
  );
}

export function useFilterTransition() {
  const ctx = useContext(FilterTransitionContext);
  if (!ctx) {
    throw new Error("useFilterTransition must be used within FilterTransitionProvider");
  }
  return ctx;
}
