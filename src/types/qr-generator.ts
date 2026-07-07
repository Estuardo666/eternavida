import type { AdminMediaAssetSummary } from "@/types/admin-home-content";

export type QrEntityType = "product" | "category" | "collection" | "static-page" | "blog-post" | "blog-category";

export type QrStaticPageKey =
  | "home"
  | "about"
  | "contact"
  | "shipping"
  | "returns"
  | "privacy"
  | "terms";

export interface QrEntityOption {
  id: string;
  label: string;
  url: string;
  entityType: QrEntityType;
}

export type QrDotType = "square" | "dots" | "rounded" | "classy" | "classy-rounded" | "extra-rounded";
export type QrCornerSquareType = "square" | "dot" | "extra-rounded";
export type QrCornerDotType = "square" | "dot";

export interface QrStyleConfig {
  dotType: QrDotType;
  cornerSquareType: QrCornerSquareType;
  cornerDotType: QrCornerDotType;
  foregroundColor: string;
  backgroundColor: string;
  gradientEnabled: boolean;
  gradientColor1: string;
  gradientColor2: string;
  logoMediaAssetId: string;
  logoMediaAssetPublicUrl: string;
  logoSize: number;
  logoMargin: number;
  margin: number;
}

export const QR_DEFAULT_STYLE: QrStyleConfig = {
  dotType: "rounded",
  cornerSquareType: "extra-rounded",
  cornerDotType: "dot",
  foregroundColor: "#0B5D1E",
  backgroundColor: "#FFFFFF",
  gradientEnabled: false,
  gradientColor1: "#0B5D1E",
  gradientColor2: "#17A33A",
  logoMediaAssetId: "",
  logoMediaAssetPublicUrl: "",
  logoSize: 0.3,
  logoMargin: 6,
  margin: 20,
};

export const QR_DOT_TYPE_OPTIONS: ReadonlyArray<{ value: QrDotType; label: string }> = [
  { value: "rounded", label: "Redondeado" },
  { value: "dots", label: "Puntos" },
  { value: "square", label: "Cuadrado" },
  { value: "classy", label: "Elegante" },
  { value: "classy-rounded", label: "Elegante redondeado" },
  { value: "extra-rounded", label: "Extra redondeado" },
];

export const QR_CORNER_SQUARE_OPTIONS: ReadonlyArray<{ value: QrCornerSquareType; label: string }> = [
  { value: "extra-rounded", label: "Extra redondeado" },
  { value: "square", label: "Cuadrado" },
  { value: "dot", label: "Punto" },
];

export const QR_CORNER_DOT_OPTIONS: ReadonlyArray<{ value: QrCornerDotType; label: string }> = [
  { value: "dot", label: "Punto" },
  { value: "square", label: "Cuadrado" },
];

export interface QrGeneratorData {
  entityOptions: QrEntityOption[];
  mediaAssets: AdminMediaAssetSummary[];
}
