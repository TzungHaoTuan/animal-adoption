import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
export function AvatarBadge({
  icon,
  label,
  variant = "default",
  className,
}: {
  icon: JSX.Element;
  label: string;
  variant?: "default" | "secondary";
  className?: string;
}) {
  return (
    <Badge
      variant={variant}
      className={`flex items-center gap-1 ${className ?? ""}`}
    >
      {icon}
      {label}
    </Badge>
  );
}
