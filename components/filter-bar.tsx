"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { countyOf, type AnimalFilters } from "@/lib/animals";
import { compareCounty } from "@/lib/taiwan-counties";
import { Button } from "./ui/button";

const ALL = "all";

const KIND_OPTIONS = [
  { value: ALL, label: "全部" },
  { value: "狗", label: "狗" },
  { value: "貓", label: "貓" },
];
const SEX_OPTIONS = [
  { value: ALL, label: "全部" },
  { value: "M", label: "男孩" },
  { value: "F", label: "女孩" },
];
const AGE_OPTIONS = [
  { value: ALL, label: "年齡（全部）" },
  { value: "ADULT", label: "成年" },
  { value: "CHILD", label: "幼年" },
];
const BODYTYPE_OPTIONS = [
  { value: ALL, label: "體型（全部）" },
  { value: "SMALL", label: "小型" },
  { value: "MEDIUM", label: "中型" },
  { value: "BIG", label: "大型" },
];
// "未提供" is folded into "否" for filtering purposes (see matchesYesNoFilter in lib/animals.ts).
const STERILIZATION_OPTIONS = [
  { value: ALL, label: "絕育（全部）" },
  { value: "T", label: "已絕育" },
  { value: "F", label: "未絕育" },
];
const BACTERIN_OPTIONS = [
  { value: ALL, label: "疫苗（全部）" },
  { value: "T", label: "已施打疫苗" },
  { value: "F", label: "未施打疫苗" },
];

type FilterKey = keyof AnimalFilters;
type Option = { value: string; label: string };

function toLabelMap(options: Option[]) {
  return Object.fromEntries(options.map((opt) => [opt.value, opt.label]));
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  const labelMap = toLabelMap(options);
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={label}>
        <SelectValue placeholder={label}>
          {(v: string | null) => (v ? (labelMap[v] ?? v) : label)}
        </SelectValue>
      </SelectTrigger>
      {/* each SelectItem is 2.25rem tall (py-2 + text-sm line-height) → N items = N*2.25rem */}
      <SelectContent className="max-h-45 overflow-y-auto">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FilterBar({
  currentFilters,
  shelterNames,
}: {
  currentFilters: AnimalFilters;
  shelterNames: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const county = currentFilters.county || ALL;

  const advancedActiveCount = [
    currentFilters.age,
    currentFilters.bodytype,
    currentFilters.sterilization,
    currentFilters.bacterin,
    currentFilters.county,
    currentFilters.shelter,
  ].filter(Boolean).length;

  const countyOptions: Option[] = [
    { value: ALL, label: "縣市（全部）" },
    ...Array.from(new Set(shelterNames.map(countyOf)))
      .sort(compareCounty)
      .map((name) => ({ value: name, label: name })),
  ];

  const shelterOptions: Option[] = [
    { value: ALL, label: "收容所（全部）" },
    ...shelterNames
      .filter((name) => county === ALL || countyOf(name) === county)
      .map((name) => ({ value: name, label: name })),
  ];

  function updateFilters(patch: Partial<Record<FilterKey, string | null>>) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(patch)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateFilter(key: FilterKey, value: string | null) {
    updateFilters({ [key]: value });
  }

  function handleCountyChange(value: string | null) {
    const nextCounty = value === null || value === ALL ? "" : value;
    // previous shelter may not belong to the new county
    updateFilters({ county: nextCounty, shelter: "" });
  }

  const hasAnyFilter = Boolean(
    currentFilters.kind || currentFilters.sex || advancedActiveCount > 0,
  );

  function handleReset() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl bg-card p-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          className="w-full sm:w-[calc(270px-10px)]"
          aria-label="種類"
          value={[currentFilters.kind || ALL]}
          onValueChange={(value) =>
            updateFilter("kind", value[0] === ALL ? "" : value[0])
          }
        >
          {KIND_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="hidden sm:block h-5.5 w-px bg-border" />

        <ToggleGroup
          className="w-full sm:w-[calc(270px-10px)]"
          aria-label="性別"
          value={[currentFilters.sex || ALL]}
          onValueChange={(value) =>
            updateFilter("sex", value[0] === ALL ? "" : value[0])
          }
        >
          {SEX_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="hidden sm:block h-5.5 w-px bg-border" />

        <Button
          onClick={() => setShowAdvanced((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
            showAdvanced && "text-foreground",
          )}
        >
          <SlidersHorizontal className="size-4" />
          更多篩選
          {advancedActiveCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {advancedActiveCount}
            </span>
          )}
        </Button>

        {hasAnyFilter && (
          <Button variant="secondary" onClick={handleReset} className="ml-auto">
            清除篩選
          </Button>
        )}
      </div>

      {/* Advanced filters: age, bodytype, sterilization, bacterin, county, shelter */}
      {showAdvanced && (
        <div className="mt-1 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-1 border-t border-border pt-2.5">
          <div>
            <FilterSelect
              label="年齡"
              value={currentFilters.age || ALL}
              options={AGE_OPTIONS}
              onChange={(value) =>
                updateFilter("age", value === ALL ? "" : value)
              }
            />
          </div>
          <div>
            <FilterSelect
              label="體型"
              value={currentFilters.bodytype || ALL}
              options={BODYTYPE_OPTIONS}
              onChange={(value) =>
                updateFilter("bodytype", value === ALL ? "" : value)
              }
            />
          </div>
          <div>
            <FilterSelect
              label="絕育狀態"
              value={currentFilters.sterilization || ALL}
              options={STERILIZATION_OPTIONS}
              onChange={(value) =>
                updateFilter("sterilization", value === ALL ? "" : value)
              }
            />
          </div>
          <div>
            <FilterSelect
              label="疫苗施打"
              value={currentFilters.bacterin || ALL}
              options={BACTERIN_OPTIONS}
              onChange={(value) =>
                updateFilter("bacterin", value === ALL ? "" : value)
              }
            />
          </div>
          <div className="col-span-2">
            <FilterSelect
              label="縣市"
              value={county}
              options={countyOptions}
              onChange={handleCountyChange}
            />
          </div>
          <div>
            <FilterSelect
              label="收容所"
              value={currentFilters.shelter || ALL}
              options={shelterOptions}
              onChange={(value) =>
                updateFilter("shelter", value === ALL ? "" : value)
              }
              disabled={county === ALL}
            />
          </div>
        </div>
      )}
    </div>
  );
}
