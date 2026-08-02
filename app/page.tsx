import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { fetchHomeStats } from "@/lib/animals";
import { cn } from "@/lib/utils";
import { MoveUp, MoveRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const stats = await fetchHomeStats();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <div className="flex w-full max-w-[1680px] flex-1 flex-col gap-8 px-6 pb-14 sm:px-6 sm:pb-8 mt-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-1 rounded-full bg-card px-4.5 py-2 text-sm font-bold text-primary-dark shadow-header-chip">
            <FileText size={16} />
            <span>全台收容所開放資料</span>
          </div>
          <h1 className="font-heading text-3xl leading-tight font-bold sm:text-5xl">
            給牠一個名字，
            <br className="sm:hidden" />
            也給牠一個<span className="text-primary-dark">溫暖的家</span>
          </h1>
          <p className="max-w-100 sm:max-w-none text-sm lg:text-base leading-relaxed text-muted-foreground">
            每一雙眼睛，都在靜靜等待一個家，
            <br className="hidden" />
            透過本網站，您可以輕鬆瀏覽全台各地的貓狗認養資訊，找到屬於您的毛小孩。
          </p>
        </div>

        <div className="mx-auto w-full max-w-6xl flex flex-col justify-center gap-5 sm:flex-row sm:gap-7">
          <HeroCard
            href="/animals?kind=貓"
            src="/images/cat_looks_outside.webp"
            hoverSrc="/images/cat_happy.webp"
            alt="貓"
            count={stats?.catCount}
            badgeClassName="bg-accent-solid text-accent-solid-foreground rotate-4 -translate-y-2"
            linkLabel="貓貓"
          />
          <HeroCard
            href="/animals?kind=狗"
            src="/images/dog_looks_outside.webp"
            hoverSrc="/images/dog_happy.webp"
            alt="狗"
            count={stats?.dogCount}
            badgeClassName="bg-accent-solid text-accent-solid-foreground -translate-y-2 -rotate-3"
            linkLabel="狗狗"
          />
        </div>

        {stats ? (
          <div className="h-full flex items-center justify-center gap-4 pt-2 sm:gap-14">
            <Stat value={stats.shelterCount} label="縣市公立收容所" />
            <Stat
              value={stats.total.toLocaleString()}
              icon={<MoveUp strokeWidth={3} width={24} />}
              label="等待認養"
            />
            <Stat value="每日" label="資料自動更新" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HeroCard({
  href,
  src,
  hoverSrc,
  alt,
  count,
  className,
  badgeClassName,
  linkLabel,
}: {
  href: string;
  src: string;
  hoverSrc: string;
  alt: string;
  count: number | undefined;
  className?: string;
  badgeClassName: string;
  linkLabel: string;
}) {
  const badgeLabel =
    count !== undefined ? `${count.toLocaleString()} 隻` : null;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex-1 rounded-[28px] bg-card p-2 transition-shadow duration-800 ease-in hover:animate-shadow-pulse",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-[20px] sm:aspect-5/4 bg-muted">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-[0_40%] transition-all duration-600 ease-in group-hover:opacity-0"
          sizes="(min-width: 640px) 50vw, 100vw"
          preload
        />
        <Image
          src={hoverSrc}
          alt={alt}
          fill
          className="object-cover object-[0_30%] transition-all duration-600 ease-in  opacity-0 group-hover:opacity-100"
          sizes="(min-width: 640px) 50vw, 100vw"
        />
      </div>
      {badgeLabel ? (
        <div
          className={cn(
            "z-20 flex items-center absolute top-0.5 left-6 rounded-full px-4 py-2 font-heading text-sm font-bold shadow-badge",
            badgeClassName,
          )}
        >
          <span>{badgeLabel}</span>
          <MoveUp width={12} />
          <span>等待中</span>
        </div>
      ) : null}
      <Button
        variant="primary"
        className="z-20 group bg-primary/80 group-hover:bg-accent-vivid flex items-center absolute bottom-6 right-6 rounded-full px-3 py-1 sm:px-6 sm:py-2 text-sm sm:text-xl font-bold"
      >
        <span>{linkLabel}</span>
        <MoveRight
          strokeWidth={2}
          className="size-6 group-hover:animate-move-right"
        />
      </Button>
    </Link>
  );
}

function Stat({
  value,
  icon,
  label,
}: {
  value: string | number;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <div className="w-40 min-h-28 flex flex-col items-center p-4 rounded bg-white/50 text-center">
      <div className="flex items-center font-heading text-2xl font-bold text-accent-solid sm:text-[32px]">
        {value}
        {icon && <span>{icon}</span>}
      </div>
      <p className="mt-2 text-muted-foreground text-xs sm:text-base">{label}</p>
    </div>
  );
}
