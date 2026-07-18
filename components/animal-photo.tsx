"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const FALLBACK_SRC: Record<string, string> = {
  貓: "/images/cat_vector_avatar.svg",
  狗: "/images/dog_vector_avatar.svg",
};

/** Shared fallback for missing `album_file` AND upstream fetch/decode failures (gov photo host is flaky). */
export function AnimalPhoto({
  src,
  alt,
  kind,
  className,
  ...props
}: Omit<ImageProps, "src"> & { src: string; kind: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const fallback = FALLBACK_SRC[kind] ?? FALLBACK_SRC["狗"];
  const showReal = Boolean(src) && !errored;

  return (
    <>
      {!showReal ? (
        <Image src={fallback} alt={alt} width={60} height={60} />
      ) : null}
      {showReal ? (
        <Image
          src={src}
          alt={alt}
          className={cn(
            className,
            "transition-all duration-1000 ease-out",
            loaded ? "opacity-100 blur-none" : "opacity-0 blur-xs",
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          {...props}
        />
      ) : null}
      {showReal && !loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <Spinner className="size-6 text-white" />
        </div>
      ) : null}
    </>
  );
}
