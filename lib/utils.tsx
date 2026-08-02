import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Sex } from "@/type";
import { JSX } from "react";
import { Venus, Mars } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sexToIcon(sex: Sex, size: number): JSX.Element | null {
  switch (sex) {
    case "F":
      return <Venus size={size} />;
    case "M":
      return <Mars size={size} />;
    default:
      return null;
  }
}
