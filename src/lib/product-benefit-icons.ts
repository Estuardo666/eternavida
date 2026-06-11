export interface ProductBenefitIconDef {
  key: string;
  label: string;
  viewBox: string;
  paths: string[];
}

export const PRODUCT_BENEFIT_ICONS: readonly ProductBenefitIconDef[] = [
  {
    key: "shield",
    label: "Proteccion",
    viewBox: "0 0 24 24",
    paths: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  },
  {
    key: "droplet",
    label: "Hidratacion",
    viewBox: "0 0 24 24",
    paths: ["M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"],
  },
  {
    key: "leaf",
    label: "Natural",
    viewBox: "0 0 24 24",
    paths: [
      "M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z",
      "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    ],
  },
  {
    key: "sun",
    label: "Radiante",
    viewBox: "0 0 24 24",
    paths: [
      "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
      "M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z",
    ],
  },
  {
    key: "sparkle",
    label: "Luminosidad",
    viewBox: "0 0 24 24",
    paths: ["M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"],
  },
  {
    key: "heart",
    label: "Bienestar",
    viewBox: "0 0 24 24",
    paths: ["M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"],
  },
  {
    key: "clock",
    label: "Anti-edad",
    viewBox: "0 0 24 24",
    paths: ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 6v6l4 2"],
  },
  {
    key: "star",
    label: "Calidad",
    viewBox: "0 0 24 24",
    paths: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  },
  {
    key: "check-circle",
    label: "Aprobado",
    viewBox: "0 0 24 24",
    paths: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"],
  },
  {
    key: "zap",
    label: "Energia",
    viewBox: "0 0 24 24",
    paths: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  },
  {
    key: "feather",
    label: "Suave",
    viewBox: "0 0 24 24",
    paths: ["M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z", "M16 8L2 22", "M17.5 15H9"],
  },
  {
    key: "flask",
    label: "Dermatologico",
    viewBox: "0 0 24 24",
    paths: [
      "M9 3h6v6l5 8.5c.6 1-.2 2.5-1.5 2.5H5.5c-1.3 0-2.1-1.5-1.5-2.5L9 9V3z",
      "M9 3h6",
    ],
  },
  {
    key: "award",
    label: "Certificado",
    viewBox: "0 0 24 24",
    paths: [
      "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z",
      "M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
    ],
  },
  {
    key: "droplets",
    label: "Nutritivo",
    viewBox: "0 0 24 24",
    paths: [
      "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",
      "M12.56 14.69c1.47 0 2.67-1.22 2.67-2.72 0-.78-.38-1.51-1.14-2.14-.76-.63-1.52-1.23-1.52-2.28 0-.7.26-1.08.56-1.45.3.37.56.75.56 1.45 0 1.05-.76 1.65-1.52 2.28-.76.63-1.14 1.36-1.14 2.14 0 1.5 1.2 2.72 2.67 2.72z",
    ],
  },
  {
    key: "scissors",
    label: "Anti-inflamatorio",
    viewBox: "0 0 24 24",
    paths: [
      "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      "M20 4L8.12 15.88",
      "M14.47 14.48L20 20",
      "M8.12 8.12L12 12",
    ],
  },
  {
    key: "wind",
    label: "Refrescante",
    viewBox: "0 0 24 24",
    paths: ["M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"],
  },
  {
    key: "eye",
    label: "Contorno de ojos",
    viewBox: "0 0 24 24",
    paths: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  },
  {
    key: "thermometer",
    label: "Termico",
    viewBox: "0 0 24 24",
    paths: ["M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"],
  },
] as const;

export const PRODUCT_BENEFIT_ICON_MAP = new Map(
  PRODUCT_BENEFIT_ICONS.map((icon) => [icon.key, icon]),
);

export const DEFAULT_BENEFIT_ICON_KEY = "check-circle";

export function getBenefitIcon(key: string): ProductBenefitIconDef | undefined {
  return PRODUCT_BENEFIT_ICON_MAP.get(key);
}
