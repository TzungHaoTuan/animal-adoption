import Link from "next/link";
import { PawPrint } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/animals", label: "認養清單", key: "animals" },
  { href: "/shelters", label: "收容所地圖", key: "shelters" },
] as const;

export function SiteHeader({
  variant = "default",
  current,
}: {
  variant?: "default" | "detail";
  current?: "animals" | "shelters";
}) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex-center size-9 rounded-full bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden />
          </span>
          <span className="font-heading text-lg font-bold text-foreground">毛孩之家</span>
        </Link>

        {variant === "detail" ? (
          <Link href="/animals" className={cn(buttonVariants({ variant: "ghost" }))}>
            ← 返回清單
          </Link>
        ) : (
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: current === link.key ? "secondary" : "ghost" }),
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
