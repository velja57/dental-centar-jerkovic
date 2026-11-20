"use client";

import Image, { type ImageProps } from "next/image";

// Unsplash sam menja veličinu slike (imgix), pa ne trošimo Next optimizaciju.
const unsplashLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 72}`;

export function Photo(props: ImageProps) {
  const isUnsplash = typeof props.src === "string" && props.src.startsWith("https://images.unsplash.com/");
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} loader={isUnsplash ? unsplashLoader : props.loader} />;
}
