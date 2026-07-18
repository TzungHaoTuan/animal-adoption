import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default async function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-140 flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            為毛孩，找一個永遠的家
          </h1>
          <p className="text-muted-foreground">
            我們串連全台收容所的開放資料，讓每一隻等待認養的貓狗都能被看見。資料每日更新，找到喜歡的孩子後，直接前往收容所現場相見。
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row">
          <Link
            href="/animals?kind=貓"
            className="relative flex-1 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
          >
            <div className="relative aspect-square bg-muted">
              <Image
                src="/images/cat_looks_outside.webp"
                alt="貓"
                fill
                className="object-cover transition-transform hover:scale-105 ease-in-out duration-300"
                sizes="(min-width: 640px) 50vw, 100vw"
                preload
              />
            </div>
          </Link>

          <Link
            href="/animals?kind=狗"
            className="relative flex-1 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
          >
            <div className="relative aspect-square bg-muted">
              <Image
                src="/images/dog_looks_outside.webp"
                alt="狗"
                fill
                className="object-cover transition-transform hover:scale-105 ease-in-out duration-300"
                sizes="(min-width: 640px) 50vw, 100vw"
                preload
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
