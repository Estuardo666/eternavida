const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export const PRODUCT_BADGE_PRESETS = [
  { label: "Nuevo", color: "#0B5D1E" },
  { label: "Oferta", color: "#C94A4A" },
  { label: "Destacado", color: "#C58A1D" },
] as const;

export const DEFAULT_PRODUCT_BADGE_COLOR = "#0B5D1E";

function expandShortHex(hexColor: string): string {
  if (hexColor.length !== 4) {
    return hexColor;
  }

  const [, red, green, blue] = hexColor;
  return `#${red}${red}${green}${green}${blue}${blue}`;
}

export function normalizeBadgeColor(color: string | null | undefined): string | null {
  if (!color) {
    return null;
  }

  const trimmedValue = color.trim();
  if (!HEX_COLOR_PATTERN.test(trimmedValue)) {
    return null;
  }

  return expandShortHex(trimmedValue).toUpperCase();
}

function hexToRgb(color: string) {
  const normalizedColor = normalizeBadgeColor(color);
  if (!normalizedColor) {
    return null;
  }

  const red = Number.parseInt(normalizedColor.slice(1, 3), 16);
  const green = Number.parseInt(normalizedColor.slice(3, 5), 16);
  const blue = Number.parseInt(normalizedColor.slice(5, 7), 16);

  return { red, green, blue };
}

function rgbToRgba(color: string, alpha: number): string {
  const rgb = hexToRgb(color) ?? hexToRgb(DEFAULT_PRODUCT_BADGE_COLOR);
  if (!rgb) {
    return `rgba(11, 93, 30, ${alpha})`;
  }

  return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alpha})`;
}

function getReadableTextColor(color: string): string {
  const rgb = hexToRgb(color) ?? hexToRgb(DEFAULT_PRODUCT_BADGE_COLOR);
  if (!rgb) {
    return "#FFFFFF";
  }

  const luminance = (0.299 * rgb.red + 0.587 * rgb.green + 0.114 * rgb.blue) / 255;
  return luminance > 0.62 ? "#102018" : "#FFFFFF";
}

export function getProductBadgeTokens(color: string | null | undefined) {
  const resolvedColor = normalizeBadgeColor(color) ?? DEFAULT_PRODUCT_BADGE_COLOR;

  return {
    backgroundColor: resolvedColor,
    borderColor: resolvedColor,
    textColor: getReadableTextColor(resolvedColor),
    shadowColor: rgbToRgba(resolvedColor, 0.18),
    solidColor: resolvedColor,
  };
}