import type { JSX } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimalPhoto } from "@/components/animal-photo";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { OpenInMapsLink } from "@/components/open-in-maps-link";
import { fetchAnimalDetail, getSummaryLine, type Animal } from "@/lib/animals";
import { AvatarBadge } from "@/components/avatar-badge";
import { Cat, Dog, Mars, Venus, MapPin, Phone } from "lucide-react";

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
        <SiteHeader variant="detail" />
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
      <SiteHeader variant="detail" />

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[600px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="relative flex-center h-105 overflow-hidden rounded-3xl bg-muted">
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

          {recommendations.length > 0 ? (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                你可能也會喜歡
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.animal_id} animal={rec} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <AvatarBadge
            icon={animal.animal_kind === "貓" ? <Cat /> : <Dog />}
            label={`ID: ${String(animal.animal_id)}`}
          />

          <InfoCard animal={animal} />
          <ShelterCard animal={animal} />
        </div>
      </div>
    </div>
  );
}

const INFO_SEX_LABEL: Record<string, JSX.Element> = {
  M: <Mars />,
  F: <Venus />,
};
const INFO_AGE_LABEL: Record<string, string> = { CHILD: "幼年", ADULT: "成年" };
const INFO_BODYTYPE_LABEL: Record<string, string> = {
  SMALL: "小型",
  MEDIUM: "中型",
  BIG: "大型",
};

function InfoCard({ animal }: { animal: Animal }) {
  const rows = [
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
    <Card className="gap-3 p-4">
      <h2 className="text-lg font-semibold text-foreground">關於我</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="text-sm font-medium text-foreground">{row.value}</p>
          </div>
        ))}
      </div>
      {animal.animal_remark && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {animal.animal_remark}
        </p>
      )}
    </Card>
  );
}

function ShelterCard({ animal }: { animal: Animal }) {
  return (
    <Card className="gap-3 p-4">
      <h2 className="text-lg font-semibold text-foreground">我在這裡</h2>
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
    <Link href={`/animals/${animal.animal_id}`} className="block">
      <Card className="overflow-hidden py-0">
        <div className="relative flex-center aspect-square bg-muted">
          <AnimalPhoto
            src={animal.album_file}
            kind={animal.animal_kind}
            alt={getSummaryLine(animal)}
            fill
            className="object-cover"
            sizes="190px"
          />
        </div>
        <p className="p-2 text-xs font-medium text-card-foreground">
          {animal.animal_kind}・{animal.animal_colour || "花色未提供"}
        </p>
      </Card>
    </Link>
  );
}
