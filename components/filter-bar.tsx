"use client";

import { usePathname, useRouter } from "next/navigation";
import type { AnimalFilters } from "@/lib/animals";

const KIND_OPTIONS = ["貓", "狗"];
const BODYTYPE_OPTIONS = [
  { value: "SMALL", label: "小型" },
  { value: "MEDIUM", label: "中型" },
  { value: "BIG", label: "大型" },
];
const SEX_OPTIONS = [
  { value: "M", label: "公" },
  { value: "F", label: "母" },
];
const STERILIZATION_OPTIONS = [
  { value: "T", label: "已絕育" },
  { value: "F", label: "未絕育" },
  { value: "N", label: "未提供" },
];

type FilterKey = keyof AnimalFilters;

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground";

export function FilterBar({ currentFilters }: { currentFilters: AnimalFilters }) {
  const router = useRouter();
  const pathname = usePathname();

  function updateFilter(key: FilterKey, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="種類"
        className={selectClassName}
        value={currentFilters.kind ?? ""}
        onChange={(e) => updateFilter("kind", e.target.value)}
      >
        <option value="">種類（全部）</option>
        {KIND_OPTIONS.map((kind) => (
          <option key={kind} value={kind}>
            {kind}
          </option>
        ))}
      </select>

      <select
        aria-label="體型"
        className={selectClassName}
        value={currentFilters.bodytype ?? ""}
        onChange={(e) => updateFilter("bodytype", e.target.value)}
      >
        <option value="">體型（全部）</option>
        {BODYTYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="性別"
        className={selectClassName}
        value={currentFilters.sex ?? ""}
        onChange={(e) => updateFilter("sex", e.target.value)}
      >
        <option value="">性別（全部）</option>
        {SEX_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="絕育狀態"
        className={selectClassName}
        value={currentFilters.sterilization ?? ""}
        onChange={(e) => updateFilter("sterilization", e.target.value)}
      >
        <option value="">絕育（全部）</option>
        {STERILIZATION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
