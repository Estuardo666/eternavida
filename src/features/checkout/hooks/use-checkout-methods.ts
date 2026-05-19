"use client";

import { useEffect, useState } from "react";

import type { PublicShippingMethod } from "@/types/admin-shipping-methods";
import type { PublicPaymentMethod } from "@/types/admin-payment-methods";

interface UseCheckoutMethodsResult {
  shippingMethods: PublicShippingMethod[];
  paymentMethods: PublicPaymentMethod[];
  isLoading: boolean;
}

export function useCheckoutMethods(): UseCheckoutMethodsResult {
  const [shippingMethods, setShippingMethods] = useState<PublicShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PublicPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMethods() {
      try {
        const [shippingRes, paymentRes] = await Promise.all([
          fetch("/api/checkout/shipping-methods"),
          fetch("/api/checkout/payment-methods"),
        ]);
        const [shippingBody, paymentBody] = await Promise.all([
          shippingRes.json() as Promise<{ success: boolean; data?: { methods: PublicShippingMethod[] } }>,
          paymentRes.json() as Promise<{ success: boolean; data?: { methods: PublicPaymentMethod[] } }>,
        ]);
        if (!cancelled) {
          if (shippingBody.success && shippingBody.data) {
            setShippingMethods(shippingBody.data.methods);
          }
          if (paymentBody.success && paymentBody.data) {
            setPaymentMethods(paymentBody.data.methods);
          }
        }
      } catch {
        // Non-critical — checkout falls back to static data
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadMethods();
    return () => { cancelled = true; };
  }, []);

  return { shippingMethods, paymentMethods, isLoading };
}
