import Image from "next/image";
import type { Animal } from "@/lib/animals";

const BODYTYPE_LABEL: Record<string, string> = {
  SMALL: "小型",
  MEDIUM: "中型",
  BIG: "大型",
};

export function AnimalCard({ animal }: { animal: Animal }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-square bg-muted">
        {animal.album_file ? (
          <Image
            src={animal.album_file}
            alt={`${animal.animal_kind} · ${animal.animal_colour || "花色未提供"}`}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="text-sm font-medium text-card-foreground">
          {animal.animal_kind} · {animal.animal_colour || "花色未提供"}
        </p>
        <p className="text-xs text-muted-foreground">
          {BODYTYPE_LABEL[animal.animal_bodytype] ?? animal.animal_bodytype}
        </p>
        <p className="text-xs text-muted-foreground">{animal.shelter_name}</p>
      </div>
    </div>
  );
}
