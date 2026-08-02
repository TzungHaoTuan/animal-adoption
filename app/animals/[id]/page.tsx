import type { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimalPhoto } from "@/components/animal-photo";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { OpenInMapsLink } from "@/components/open-in-maps-link";
import {
  fetchAnimalDetail,
  getDisplayName,
  getSummaryLine,
  type Animal,
} from "@/lib/animals";
import { AvatarBadge } from "@/components/avatar-badge";
import { Mars, Venus, MapPin, Phone, Heart } from "lucide-react";
import { AnimalKind } from "@/type";
import { cn } from "@/lib/utils";

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  let result;
  try {
    result = await fetchAnimalDetail(numericId);
  } catch {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <p className="py-16 text-center text-muted-foreground">
          資料讀取失敗，請稍後再試一次。
        </p>
      </div>
    );
  }
  if (!result) notFound();
  const { animal, recommendations } = result;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <div className="flex flex-col justify-between flex-1 mx-auto w-full max-w-6xl gap-8 px-4 pt-6 pb-16 sm:px-6">
        <div className="w-full flex flex-col flex-1 lg:flex-row items-stretch gap-4">
          <div className="min-h-90 flex-1 relative flex-center overflow-hidden rounded-3xl bg-muted border-6 border-primary">
            <AnimalPhoto
              src={animal.album_file}
              kind={animal.animal_kind}
              alt={getSummaryLine(animal)}
              fill
              className="object-cover"
              sizes="600px"
              preload
            />
          </div>
          {/* Info Section */}
          <div className="flex flex-col gap-4 w-full max-w-120">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <AvatarBadge
                  className="self-start"
                  color={animal.animal_colour || undefined}
                  kind={animal.animal_kind as AnimalKind | undefined}
                />
              </div>
              <Heart
                fill="currentColor"
                className="size-6.5 shrink-0 text-primary"
                aria-hidden
              />
            </div>
            <InfoCard animal={animal} className="flex-1" />
            <ShelterCard animal={animal} />
          </div>
        </div>
        {recommendations.length > 0 ? (
          <div>
            <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
              你可能也會喜歡
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.animal_id} animal={rec} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const INFO_SEX_LABEL: Record<string, JSX.Element> = {
  M: <Mars size={20} />,
  F: <Venus size={20} />,
};
const INFO_AGE_LABEL: Record<string, string> = { CHILD: "幼年", ADULT: "成年" };
const INFO_BODYTYPE_LABEL: Record<string, string> = {
  SMALL: "小型",
  MEDIUM: "中型",
  BIG: "大型",
};

function InfoCard({
  animal,
  className,
}: {
  animal: Animal;
  className?: string;
}) {
  const rows = [
    { label: "編號", value: getDisplayName(animal) },
    { label: "性別", value: INFO_SEX_LABEL[animal.animal_sex] ?? "未提供" },
    { label: "年齡", value: INFO_AGE_LABEL[animal.animal_age] ?? "未提供" },
    {
      label: "體型",
      value: INFO_BODYTYPE_LABEL[animal.animal_bodytype] ?? "未提供",
    },
    {
      label: "絕育狀態",
      value: animal.animal_sterilization === "T" ? "已絕育" : "未絕育",
    },
    {
      label: "疫苗施打",
      value: animal.animal_bacterin === "T" ? "已施打疫苗" : "未施打疫苗",
    },
  ];

  return (
    <Card className={cn("gap-3.5 p-5", className)}>
      <h2 className="font-heading text-lg font-bold text-foreground">關於我</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="text-sm font-medium text-foreground">{row.value}</p>
          </div>
        ))}
      </div>
      {animal.animal_remark && (
        <div className="h-full rounded-xl bg-accent px-4 py-3.5">
          <p className="text-sm leading-relaxed text-accent-foreground">
            {animal.animal_remark}
          </p>
        </div>
      )}
    </Card>
  );
}

function ShelterCard({ animal }: { animal: Animal }) {
  return (
    <Card className="gap-3.5 p-5">
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{animal.shelter_name}</p>
        <div className="flex items-center gap-1">
          <MapPin className="inline-block w-4 h-4" />
          <p>{animal.shelter_address}</p>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="inline-block w-4 h-4" />
          <p>{animal.shelter_tel}</p>
        </div>
      </div>
      <OpenInMapsLink
        query={`${animal.shelter_name} ${animal.shelter_address}`}
      />
    </Card>
  );
}

function RecommendationCard({ animal }: { animal: Animal }) {
  return (
    <Link href={`/animals/${animal.animal_id}`}>
      <div className="relative flex-center aspect-square bg-muted rounded-2xl shadow-xl overflow-hidden">
        <AnimalPhoto
          src={animal.album_file}
          kind={animal.animal_kind}
          alt={getSummaryLine(animal)}
          fill
          className="object-cover"
          sizes="190px"
        />
        <AvatarBadge
          variant="primary"
          color={animal.animal_colour}
          kind={animal.animal_kind as AnimalKind | undefined}
          className="absolute top-3 left-3"
        />
      </div>
    </Link>
  );
}
