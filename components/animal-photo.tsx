"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const FALLBACK_SRC: Record<string, string> = {
  貓: "/images/cat_looks_outside.webp",
  狗: "/images/dog_looks_outside.webp",
};

export function AnimalPhoto({
  src,
  alt,
  kind,
  className,
  ...props
}: Omit<ImageProps, "src"> & { src: string; kind: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const fallbackImage = FALLBACK_SRC[kind] ?? FALLBACK_SRC["狗"];
  const hasPhoto = Boolean(src) && !errored;

  return (
    <>
      {hasPhoto ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            className,
            "transition-all duration-1000 ease-out",
            loaded ? "opacity-100 blur-none" : "opacity-0 blur-xs",
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          {...props}
        />
      ) : (
        <Image
          src={fallbackImage}
          alt={alt}
          fill
          className={cn(className, "opacity-20 blur-xs brightness-150")}
          {...props}
        />
      )}
      {hasPhoto && !loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <Spinner className="size-6 text-white" />
        </div>
      ) : null}
    </>
  );
}
