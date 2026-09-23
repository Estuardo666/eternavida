import "server-only";

const LOCAL_FALLBACK_IP = "127.0.0.1";

/**
 * Datafast exige la IP del comprador, no la del servidor. Vercel propaga
 * x-forwarded-for con la IP real del cliente en la primera posicion.
 */
export function resolveClientIp(headers: Headers | { headers: Headers }): string {
  const h = headers instanceof Headers ? headers : headers.headers;
  const forwarded = h.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    "";

  return candidate || LOCAL_FALLBACK_IP;
}
