import Link from "next/link";
import { Heart } from "lucide-react";
import { AnimalPhoto } from "@/components/animal-photo";
import { getDisplayName, type Animal } from "@/lib/animals";
import { sexToIcon } from "@/lib/utils";
import type { Sex } from "@/type";

export function AnimalCard({
  animal,
  preload = false,
}: {
  animal: Animal;
  preload?: boolean;
}) {
  const {
    animal_kind,
    animal_sex,
    animal_age,
    animal_sterilization,
    animal_bacterin,
  } = animal;

  const ageLabel = animal_age === "CHILD" ? "幼年" : "成年";
  const sexIcon = sexToIcon(animal_sex as Sex, 12);

  return (
    <Link
      href={`/animals/${animal.animal_id}`}
      className="flex flex-col rounded-3xl bg-card p-2.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-background flex-center">
        <AnimalPhoto
          src={animal.album_file}
          kind={animal_kind}
          alt={animal.animal_title || `${animal_kind} ${animal.animal_colour}`}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          preload={preload}
        />

        <div className="absolute flex items-center gap-1 top-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-foreground">
          {sexIcon} {ageLabel}
        </div>
        <div className="w-full flex items-center gap-1 absolute bottom-2.5 left-2.5">
          {animal_sterilization === "T" && (
            <span className="rounded-full bg-accent-solid px-2.5 py-1 text-xs font-bold text-accent-solid-foreground">
              ✓ 已絕育
            </span>
          )}
          {animal_bacterin === "T" && (
            <span className="rounded-full bg-accent-solid px-2.5 py-1 text-xs font-bold text-accent-solid-foreground">
              ✓ 已施打疫苗
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-2.5 pt-3.5 pb-2">
        <div className="flex items-center justify-between">
          <span className="truncate font-heading text-lg font-bold">
            {getDisplayName(animal)}
          </span>
          <Heart className="size-4.5 shrink-0 text-primary" aria-hidden />
        </div>
        <span className="truncate text-sm text-muted-foreground">
          {animal.shelter_name}
        </span>
      </div>
    </Link>
  );
}
