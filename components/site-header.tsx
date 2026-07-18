import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({
  variant = "default",
  active = false,
}: {
  variant?: "default" | "detail";
  active?: boolean;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          毛
        </span>
        <span className="text-lg font-bold text-foreground">毛孩之家</span>
      </Link>

      {variant === "detail" ? (
        <Link href="/animals" className={cn(buttonVariants({ variant: "ghost" }))}>
          ← 返回清單
        </Link>
      ) : (
        <Link
          href="/animals"
          className={cn(buttonVariants({ variant: active ? "secondary" : "ghost" }))}
        >
          認養清單
        </Link>
      )}
    </header>
  );
}
