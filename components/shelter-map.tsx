"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Clock, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { OpenInMapsLink } from "@/components/open-in-maps-link";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const isMobile = useIsMobile();

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

  const handleShelterClick = (shelterId: string) => {
    setSelectedId(shelterId);
    if (isMobile) {
      setShowDetailDrawer(true);
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col sm:flex-row gap-4">
      <div className="isolate w-full h-100 overflow-hidden rounded-3xl bg-muted sm:flex-1 lg:h-[70vh]">
        <ShelterMapLeaflet
          shelters={filteredShelters}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className="w-full min-h-0 flex-1 sm:max-w-90 flex flex-col gap-3 lg:h-[70vh]">
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
          <SelectContent className="max-h-80 sm:max-h-120 overflow-y-auto">
            <SelectItem value={ALL}>{ALL_LABEL}</SelectItem>
            {countyOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && !isMobile && (
          <ShelterDetail shelter={selected} className="mr-4" />
        )}

        <div className="flex-1 min-h-0 overflow-y-auto pr-4 pl-1 container-fade-in-out">
          <div className="flex flex-col gap-2 pt-2 pb-3">
            {filteredShelters.map((shelter) => (
              <Card
                key={shelter.ID}
                role="button"
                tabIndex={0}
                onClick={() => {
                  handleShelterClick(shelter.ID);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleShelterClick(shelter.ID);
                }}
                className={cn(
                  "cursor-pointer gap-1 p-3 transition-colors",
                  shelter.ID === selectedId ? "bg-accent" : "hover:bg-muted",
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

      <Drawer
        open={isMobile && showDetailDrawer}
        onOpenChange={(open) => {
          if (!open) setShowDetailDrawer(false);
        }}
        showSwipeHandle
        blurOverlay={false}
      >
        <DrawerContent>
          {selected && (
            <>
              <DrawerHeader>
                <DrawerTitle>{selected.ShelterName}</DrawerTitle>
              </DrawerHeader>
              <ShelterDetailBody shelter={selected} className="p-4 pt-2" />
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function ShelterDetail({
  shelter,
  className,
}: {
  shelter: Shelter;
  className?: string;
}) {
  return (
    <Card className={cn("gap-3.5 p-5", className)}>
      <h2 className="font-heading text-lg font-bold text-foreground">
        {shelter.ShelterName}
      </h2>
      <ShelterDetailBody shelter={shelter} />
    </Card>
  );
}

function ShelterDetailBody({
  shelter,
  className,
}: {
  shelter: Shelter;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
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
    </div>
  );
}
