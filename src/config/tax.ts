/** IVA vigente en Ecuador. */
export const IVA_RATE = 0.15;

export interface IvaBreakdown {
  /** Base tarifa 0% (productos exentos). */
  base0: number;
  /** Base imponible gravada. */
  baseImp: number;
  /** Valor del IVA. */
  iva: number;
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Los precios del catalogo se manejan con IVA incluido, por lo que el total se
 * desglosa hacia atras. El residuo de centavo cae sobre el IVA para garantizar
 * base0 + baseImp + iva === total.
 */
export function splitIvaIncluded(total: number, rate: number = IVA_RATE): IvaBreakdown {
  const safeTotal = roundCurrency(Math.max(total, 0));
  const baseImp = roundCurrency(safeTotal / (1 + rate));
  const iva = roundCurrency(safeTotal - baseImp);

  return { base0: 0, baseImp, iva };
}
