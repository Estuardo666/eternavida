"use client";

import { useEffect, useRef, useState } from "react";

import type { CheckoutShippingMethod } from "@/config/checkout";
import type { CartItem } from "@/features/cart/types";
import {
  CheckoutPricePreviewError,
  getCheckoutPricePreview,
} from "@/services/checkout/get-checkout-price-preview";
import type { CheckoutPricingPreview } from "@/types/checkout-pricing";

interface UseCheckoutPricingPreviewOptions {
  items: CartItem[];
  shippingMethod: CheckoutShippingMethod;
  enabled?: boolean;
  /**
   * Se invoca cuando el catalogo ya no tiene alguno de los productos del
   * carrito (por ejemplo, tras reimportar el catalogo con ids nuevos).
   */
  onMissingProducts?: (missingProductIds: string[]) => void;
}

interface UseCheckoutPricingPreviewResult {
  preview: CheckoutPricingPreview | null;
  isLoading: boolean;
  errorMessage: string | null;
  draftCouponCode: string;
  setDraftCouponCode: (value: string) => void;
  applyCouponCode: () => void;
  appliedCouponCode: string | null;
  hasPendingCouponChanges: boolean;
}

export function useCheckoutPricingPreview(
  options: UseCheckoutPricingPreviewOptions,
): UseCheckoutPricingPreviewResult {
  const [preview, setPreview] = useState<CheckoutPricingPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftCouponCode, setDraftCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const requestSequenceRef = useRef(0);
  const onMissingProductsRef = useRef(options.onMissingProducts);

  useEffect(() => {
    onMissingProductsRef.current = options.onMissingProducts;
  }, [options.onMissingProducts]);

  useEffect(() => {
    if (options.items.length === 0) {
      setPreview(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    if (options.enabled === false) {
      setIsLoading(false);
      return;
    }

    const requestSequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestSequence;
    setIsLoading(true);
    setErrorMessage(null);

    void getCheckoutPricePreview({
      items: options.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingMethod: options.shippingMethod,
      couponCode: appliedCouponCode,
    })
      .then((nextPreview) => {
        if (requestSequenceRef.current !== requestSequence) {
          return;
        }

        setPreview(nextPreview);
      })
      .catch((error) => {
        if (requestSequenceRef.current !== requestSequence) {
          return;
        }

        if (
          error instanceof CheckoutPricePreviewError &&
          error.code === "PRODUCT_NOT_FOUND" &&
          error.missingProductIds.length > 0
        ) {
          onMissingProductsRef.current?.(error.missingProductIds);
          setErrorMessage(
            "Quitamos de tu carrito productos que ya no están disponibles. Revisá el resumen antes de continuar.",
          );
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "No se pudo calcular el total del checkout.");
      })
      .finally(() => {
        if (requestSequenceRef.current !== requestSequence) {
          return;
        }

        setIsLoading(false);
      });
  }, [options.enabled, options.items, options.shippingMethod, appliedCouponCode]);

  const normalizedDraftCouponCode = normalizeCouponCode(draftCouponCode);
  const hasPendingCouponChanges = normalizedDraftCouponCode !== appliedCouponCode;

  function handleApplyCouponCode() {
    setAppliedCouponCode(normalizedDraftCouponCode);
  }

  return {
    preview,
    isLoading,
    errorMessage,
    draftCouponCode,
    setDraftCouponCode,
    applyCouponCode: handleApplyCouponCode,
    appliedCouponCode,
    hasPendingCouponChanges,
  };
}

function normalizeCouponCode(value: string): string | null {
  const normalizedValue = value.trim().toUpperCase();
  return normalizedValue.length > 0 ? normalizedValue : null;
}