const CF_ZONE = "dermatologika.com";

export function cfImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const params = [
    `width=${width}`,
    "format=auto",
    "fit=scale-down",
    `quality=${quality || 75}`,
  ].join(",");

  const sourceUrl = src.startsWith("http") ? src : `https://media.${CF_ZONE}${src}`;

  return `https://${CF_ZONE}/cdn-cgi/image/${params}/${sourceUrl}`;
}