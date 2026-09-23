export interface DatafastCartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface DatafastCheckoutInput {
  /** merchantTransactionId: usamos el orderNumber. */
  merchantTransactionId: string;
  amount: number;
  customer: {
    givenName: string;
    middleName?: string | undefined;
    surname: string;
    email: string;
    phone: string;
    ip: string;
    merchantCustomerId: string;
    identificationDocId: string;
  };
  billing: { street1: string; country: string };
  shipping: { street1: string; country: string };
  items: DatafastCartItem[];
  tax: { base0: number; baseImp: number; iva: number };
}

export interface DatafastCheckoutResponse {
  id: string;
  ndc?: string | undefined;
  result: { code: string; description: string };
}

export interface DatafastPaymentResult {
  id?: string | undefined;
  paymentType?: string | undefined;
  amount?: string | undefined;
  currency?: string | undefined;
  merchantTransactionId?: string | undefined;
  result: { code: string; description: string };
  card?:
    | {
        bin?: string | undefined;
        last4Digits?: string | undefined;
        holder?: string | undefined;
        expiryMonth?: string | undefined;
        expiryYear?: string | undefined;
      }
    | undefined;
  paymentBrand?: string | undefined;
  resultDetails?: Record<string, string> | undefined;
  timestamp?: string | undefined;
  raw: Record<string, unknown>;
}
