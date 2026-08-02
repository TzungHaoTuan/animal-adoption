import { cn } from "@/lib/utils";
import type { AnimalKind } from "@/type";
import { Cat, Dog } from "lucide-react";

export function AvatarBadge({
  color,
  kind,
  variant = "default",
  className,
}: {
  color?: string;
  kind?: AnimalKind;
  variant?: "default" | "primary";
  className?: string;
}) {
  let label = "";
  if (kind) {
    label += `${kind}`;
  }
  if (color) {
    label += ` • ${color}`;
  }

  const variantClass = {
    default: "bg-card text-card-foreground",
    primary: "bg-primary text-primary-foreground",
  };

  const icon = kind === "貓" ? <Cat /> : kind === "狗" ? <Dog /> : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold shadow-header-chip [&_svg]:size-3.5",
        variantClass[variant],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
