export type DatafastOutcome = "approved" | "review" | "pending" | "rejected";

/** Transacciones exitosas (produccion y modo test del conector). */
const SUCCESS = /^(000\.000\.|000\.100\.1|000\.[36]|000\.400\.[1][12]0)/;
/** Exitosas pero sujetas a revision manual del comercio. */
const MANUAL_REVIEW = /^(000\.400\.0[^3]|000\.400\.100)$/;
/** La transaccion aun no se completa (checkout abierto, 3DS en curso, etc.). */
const PENDING = /^(000\.200|800\.400\.5|100\.400\.500)/;

export function classifyResultCode(code: string | undefined | null): DatafastOutcome {
  if (!code) return "rejected";
  if (MANUAL_REVIEW.test(code)) return "review";
  if (SUCCESS.test(code)) return "approved";
  if (PENDING.test(code)) return "pending";
  return "rejected";
}

export function isApproved(code: string | undefined | null): boolean {
  return classifyResultCode(code) === "approved";
}
