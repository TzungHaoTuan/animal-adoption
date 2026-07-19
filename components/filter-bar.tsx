"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AnimalFilters } from "@/lib/animals";
import { compareCounty } from "@/lib/taiwan-counties";

const ALL = "all";

const KIND_OPTIONS = [
  { value: ALL, label: "全部" },
  { value: "狗", label: "狗" },
  { value: "貓", label: "貓" },
];
const SEX_OPTIONS = [
  { value: ALL, label: "性別（全部）" },
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
  { value: ALL, label: "疫苗施打（全部）" },
  { value: "T", label: "已施打疫苗" },
  { value: "F", label: "未施打疫苗" },
];

type FilterKey = keyof AnimalFilters;
type Option = { value: string; label: string };

function toLabelMap(options: Option[]) {
  return Object.fromEntries(options.map((opt) => [opt.value, opt.label]));
}

// Taiwanese county/city names are always exactly 3 characters (e.g. 臺北市,
// 新北市, 宜蘭縣), and every shelter_name in this dataset starts with one —
// confirmed against live data rather than assumed.
function countyOf(shelterName: string) {
  return shelterName.slice(0, 3);
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
      <SelectContent>
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

  // County is a client-side staging step, not a real filter — the actual
  // filter dimension is still `shelter`. Seed it from the current shelter
  // filter so a shared/bookmarked URL still shows the right county selected.
  const [county, setCounty] = useState(() => {
    const current = currentFilters.shelter;
    return current ? countyOf(current) : ALL;
  });

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

  function updateFilter(key: FilterKey, value: string | null) {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleCountyChange(value: string | null) {
    setCounty(value === null ? ALL : value);
    updateFilter("shelter", ""); // previous shelter may not belong to the new county
  }

  return (
    <Card className="flex-row flex-wrap items-center gap-3 p-3">
      <ToggleGroup
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

      <div className="h-6 w-px bg-border" />

      <FilterSelect
        label="性別"
        value={currentFilters.sex || ALL}
        options={SEX_OPTIONS}
        onChange={(value) => updateFilter("sex", value === ALL ? "" : value)}
      />
      <FilterSelect
        label="年齡"
        value={currentFilters.age || ALL}
        options={AGE_OPTIONS}
        onChange={(value) => updateFilter("age", value === ALL ? "" : value)}
      />
      <FilterSelect
        label="體型"
        value={currentFilters.bodytype || ALL}
        options={BODYTYPE_OPTIONS}
        onChange={(value) =>
          updateFilter("bodytype", value === ALL ? "" : value)
        }
      />
      <FilterSelect
        label="絕育狀態"
        value={currentFilters.sterilization || ALL}
        options={STERILIZATION_OPTIONS}
        onChange={(value) =>
          updateFilter("sterilization", value === ALL ? "" : value)
        }
      />
      <FilterSelect
        label="疫苗施打"
        value={currentFilters.bacterin || ALL}
        options={BACTERIN_OPTIONS}
        onChange={(value) =>
          updateFilter("bacterin", value === ALL ? "" : value)
        }
      />
      <FilterSelect
        label="縣市"
        value={county}
        options={countyOptions}
        onChange={handleCountyChange}
      />
      <FilterSelect
        label="收容所"
        value={currentFilters.shelter || ALL}
        options={shelterOptions}
        onChange={(value) =>
          updateFilter("shelter", value === ALL ? "" : value)
        }
        disabled={county === ALL}
      />
    </Card>
  );
}
