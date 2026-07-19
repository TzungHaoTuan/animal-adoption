"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Clock, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { OpenInMapsLink } from "@/components/open-in-maps-link";
import type { Shelter } from "@/lib/shelters";
import { compareCounty } from "@/lib/taiwan-counties";
import { cn } from "@/lib/utils";

const ALL = "all";
const ALL_LABEL = "縣市（全部）";

const ShelterMapLeaflet = dynamic(
  () =>
    import("@/components/shelter-map-leaflet").then((m) => m.ShelterMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="flex-center h-full w-full">
        <Spinner />
      </div>
    ),
  },
);

export function ShelterMap({ shelters }: { shelters: Shelter[] }) {
  const [county, setCounty] = useState(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const countyOptions = useMemo(
    () =>
      Array.from(new Set(shelters.map((s) => s.CityName))).sort(compareCounty),
    [shelters],
  );

  const filteredShelters = useMemo(
    () => shelters.filter((s) => county === ALL || s.CityName === county),
    [shelters, county],
  );

  const selected = filteredShelters.find((s) => s.ID === selectedId) ?? null;

  function handleCountyChange(value: string | null) {
    setCounty(value ?? ALL);
    setSelectedId(null);
  }

  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="h-100 overflow-hidden rounded-2xl bg-muted lg:h-[70vh]">
        <ShelterMapLeaflet
          shelters={filteredShelters}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className="flex flex-col gap-3 lg:h-[70vh]">
        <Select
          value={county}
          onValueChange={(value) => handleCountyChange(value as string | null)}
        >
          <SelectTrigger aria-label="縣市">
            <SelectValue placeholder={ALL_LABEL}>
              {(value: string | null) =>
                value && value !== ALL ? value : ALL_LABEL
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{ALL_LABEL}</SelectItem>
            {countyOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && <ShelterDetail shelter={selected} />}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {filteredShelters.map((shelter) => (
              <Card
                key={shelter.ID}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(shelter.ID)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setSelectedId(shelter.ID);
                }}
                className={cn(
                  "cursor-pointer gap-1 p-3 transition-colors hover:bg-muted",
                  shelter.ID === selectedId && "bg-accent",
                )}
              >
                <p className="font-medium text-foreground">
                  {shelter.ShelterName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {shelter.CityName}・{shelter.Address}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShelterDetail({ shelter }: { shelter: Shelter }) {
  return (
    <Card className="gap-3 p-4">
      <h2 className="text-base font-bold text-foreground">
        {shelter.ShelterName}
      </h2>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="inline-block w-4 h-4" />
          <p>{shelter.Address}</p>
        </div>
        {shelter.Phone && (
          <div className="flex items-start gap-1">
            <Phone className="mt-0.5 inline-block w-4 h-4 shrink-0" />
            <div>
              {shelter.Phone.split(/[;；]/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>
          </div>
        )}
        {shelter.OpenTime && (
          <div className="flex items-start gap-1">
            <Clock className="mt-0.5 inline-block w-4 h-4 shrink-0" />
            <div>
              {shelter.OpenTime.split(/<br\s*\/?>/i).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <OpenInMapsLink query={`${shelter.ShelterName} ${shelter.Address}`} />
    </Card>
  );
}
