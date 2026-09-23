export interface CheckoutPricingErrorDetails {
  /** Productos del carrito que ya no existen en el catalogo. */
  missingProductIds?: string[];
}

export class CheckoutPricingError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: CheckoutPricingErrorDetails;

  constructor(
    code: string,
    message: string,
    status = 422,
    details: CheckoutPricingErrorDetails = {},
  ) {
    super(message);
    this.name = "CheckoutPricingError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
