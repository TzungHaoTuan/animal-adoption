"use client";

import Link from "next/link";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/animals", label: "找毛孩", key: "animals" },
  { href: "/shelters", label: "收容所地圖", key: "shelters" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isDetail = pathname.startsWith("/animals/");

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex-center size-8.5 shrink-0 rounded-full bg-primary text-primary-foreground shadow-[0_2px_0_var(--primary-shadow)] sm:size-10.5">
            <PawPrint fill="currentColor" size={20} aria-hidden />
          </span>
        </Link>

        {isDetail ? (
          <Link
            href="/animals"
            prefetch={true}
            className="rounded-full bg-card px-4.5 py-2 text-sm font-bold shadow-header-chip"
          >
            ← 返回清單
          </Link>
        ) : (
          <nav className="flex items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                prefetch={true}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  pathname.startsWith(link.href)
                    ? "font-bold text-primary"
                    : "text-foreground hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
