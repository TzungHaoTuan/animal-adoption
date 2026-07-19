import type { JSX } from "react";

import Link from "next/link";
import { AnimalPhoto } from "@/components/animal-photo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSummaryLine, type Animal } from "@/lib/animals";
import { Cat, Dog, Mars, Venus } from "lucide-react";

type BadgeInfo = {
  label: string | JSX.Element;
  variant: "default" | "secondary";
};

export function AnimalCard({
  animal,
  preload = false,
}: {
  animal: Animal;
  preload?: boolean;
}) {
  // sex: M/F
  // age: ADULT/CHILD
  // bodytype: SMALL/MEDIUM/BIG
  // sterilization: T/F/N
  // bacterin: T/F/N
  const {
    animal_kind,
    animal_sex,
    animal_age,
    animal_bodytype,
    animal_sterilization,
    animal_bacterin,
  } = animal;
  const badges: BadgeInfo[] = [
    { label: animal_kind === "貓" ? <Cat /> : <Dog />, variant: "default" },
    { label: animal_sex === "F" ? <Venus /> : <Mars />, variant: "default" },
    { label: animal_age === "CHILD" ? "幼年" : "成年", variant: "default" },
    {
      label:
        animal_bodytype === "SMALL"
          ? "小型"
          : animal_bodytype === "MEDIUM"
            ? "中型"
            : "大型",
      variant: "default",
    },
    {
      label: animal_sterilization === "T" ? "已絕育" : "",
      variant: "default",
    },
    {
      label: animal_bacterin === "T" ? "已施打疫苗" : "",
      variant: "default",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Link href={`/animals/${animal.animal_id}`}>
        <Card className="overflow-hidden py-0 w-full h-60 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="relative flex justify-center items-center h-full bg-muted">
            <AnimalPhoto
              src={animal.album_file}
              kind={animal.animal_kind}
              alt={getSummaryLine(animal)}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              preload={preload}
            />
          </div>
        </Card>
      </Link>
      <div className="flex gap-1">
        {badges.map((badge, index) =>
          badge.label ? (
            <Badge key={index} variant={badge.variant}>
              {badge.label}
            </Badge>
          ) : null,
        )}
      </div>
    </div>
  );
}
