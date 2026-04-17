// Lazy Loaded Image Component
// Optimizes image loading with native lazy loading, LQIP (Low Quality Image Placeholder)
// and responsive srcsets

"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  containerClassName?: string;
  showPlaceholder?: boolean;
}

export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  showPlaceholder = true,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Blur placeholder while loading */}
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
      )}

      <Image
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          className,
          isLoading && "blur-sm",
          !isLoading && "blur-0",
          "transition-[filter] duration-300"
        )}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500 text-sm">
          Error loading image
        </div>
      )}
    </div>
  );
}
