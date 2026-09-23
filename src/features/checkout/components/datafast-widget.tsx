"use client";

import { useEffect, useRef } from "react";

interface DatafastWidgetProps {
  checkoutId: string;
  widgetScriptUrl: string;
  brands: string;
  shopperResultUrl: string;
}

declare global {
  interface Window {
    wpwlOptions?: Record<string, unknown>;
  }
}

/**
 * Tipografia aplicada dentro de los iframes de PCI (numero de tarjeta y CVV).
 * Esos campos viven en un documento aparte, asi que el CSS de la pagina no los
 * alcanza: la unica via es la opcion iframeStyles del widget.
 */
const IFRAME_FIELD_STYLE = {
  "font-size": "15px",
  "font-family":
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: "#16241a",
};

const IFRAME_PLACEHOLDER_STYLE = {
  ...IFRAME_FIELD_STYLE,
  color: "#9aa39b",
};

/**
 * Widget COPYandPAY de Datafast en modo "plain": sin el CSS de fabrica del
 * gateway, para poder vestirlo con nuestros propios tokens de marca via las
 * clases wpwl-*. El script debe inyectarse despues de definir wpwlOptions y
 * removerse al desmontar para permitir reintentos con un checkoutId nuevo.
 */
export function DatafastWidget({
  checkoutId,
  widgetScriptUrl,
  brands,
  shopperResultUrl,
}: DatafastWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.wpwlOptions = {
      locale: "es",
      style: "plain",
      brandDetection: true,
      // Nota: la clave del vencimiento es expiryDate; "expiry" el widget la ignora.
      labels: {
        brand: "Tipo de tarjeta",
        cardNumber: "Número de la tarjeta",
        expiryDate: "Vencimiento",
        cardHolder: "Nombre en la tarjeta",
        cvv: "CVV",
        submit: "Pagar ahora",
      },
      iframeStyles: {
        "card-number-placeholder": IFRAME_PLACEHOLDER_STYLE,
        "cvv-placeholder": IFRAME_PLACEHOLDER_STYLE,
        "card-number": IFRAME_FIELD_STYLE,
        cvv: IFRAME_FIELD_STYLE,
      },
    };

    const script = document.createElement("script");
    script.src = `${widgetScriptUrl}?checkoutId=${encodeURIComponent(checkoutId)}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      delete window.wpwlOptions;
      document
        .querySelectorAll('script[src*="paymentWidgets"], .wpwl-container, iframe[name^="oppwa"]')
        .forEach((node) => node.remove());
    };
  }, [checkoutId, widgetScriptUrl]);

  return (
    <div ref={containerRef} className="datafast-widget w-full">
      <form action={shopperResultUrl} className="paymentWidgets" data-brands={brands} />

      <style jsx global>{`
        /* ── Rejilla ────────────────────────────────────────────────────────
           El widget entrega los grupos en orden brand → cardNumber → expiry →
           cardHolder → cvv. Los reordenamos con la propiedad order para llegar al orden
           natural de un formulario de tarjeta sin tocar el DOM del gateway. */
        .datafast-widget .wpwl-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem 0.75rem;
          padding: 0;
          margin: 0;
          font-family: inherit;
        }
        .datafast-widget .wpwl-form > * {
          grid-column: 1 / -1;
          min-width: 0;
        }
        .datafast-widget .wpwl-form .wpwl-group {
          margin: 0;
          padding: 0;
          float: none;
        }
        .datafast-widget .wpwl-form .wpwl-group-brand {
          order: 1;
        }
        .datafast-widget .wpwl-form .wpwl-group-cardNumber {
          order: 2;
        }
        .datafast-widget .wpwl-form .wpwl-group-cardHolder {
          order: 3;
        }
        .datafast-widget .wpwl-form .wpwl-group-expiry {
          order: 4;
          grid-column: span 1;
        }
        .datafast-widget .wpwl-form .wpwl-group-cvv {
          order: 5;
          grid-column: span 1;
        }
        .datafast-widget .wpwl-form .wpwl-group-submit {
          order: 9;
          margin-top: 0.25rem;
        }

        /* ── Etiquetas y contenedores ───────────────────────────────────────
           Por defecto vienen flotados a la izquierda con ancho fijo (33% o
           63px), lo que partia "Tipo de tarjeta" en tres lineas y dejaba el
           select en 39px. Los pasamos a bloque a ancho completo. */
        .datafast-widget .wpwl-form .wpwl-label,
        .datafast-widget .wpwl-form .wpwl-wrapper {
          float: none;
          width: 100%;
          max-width: 100%;
          padding: 0;
          text-align: left;
        }
        .datafast-widget .wpwl-form .wpwl-label {
          display: block;
          margin: 0 0 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.3;
          color: var(--text-secondary, #4b5563);
          white-space: nowrap;
        }
        .datafast-widget .wpwl-form .wpwl-wrapper {
          position: relative;
          display: block;
        }

        /* ── Campos ─────────────────────────────────────────────────────────
           cardNumber y cvv son iframes de PCI: aca solo se estiliza la caja;
           el interior va por iframeStyles. */
        .datafast-widget .wpwl-form .wpwl-control {
          box-sizing: border-box;
          width: 100%;
          height: 2.75rem;
          padding: 0 0.875rem;
          border: 1px solid var(--border, #e2e5e0);
          border-radius: 0.625rem;
          background: #fff;
          font-size: 0.9375rem;
          font-family: inherit;
          color: var(--text-primary, #16241a);
          box-shadow: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .datafast-widget .wpwl-form .wpwl-control-iframe {
          padding: 0 0.75rem;
        }
        .datafast-widget .wpwl-form .wpwl-control:hover {
          border-color: var(--border-brand, #0b5d1e);
        }
        .datafast-widget .wpwl-form .wpwl-control:focus,
        .datafast-widget .wpwl-form .wpwl-control-iframe.wpwl-focus {
          outline: none;
          border-color: var(--brand-primary, #0b5d1e);
          box-shadow: 0 0 0 3px rgba(11, 93, 30, 0.14);
        }
        .datafast-widget .wpwl-form select.wpwl-control {
          appearance: none;
          padding-right: 2.25rem;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%235b6b5e' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.875rem center;
          cursor: pointer;
        }

        /* Chip de marca detectada, dentro del campo de numero. */
        .datafast-widget .wpwl-form .wpwl-brand {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 2.25rem;
          height: 1.5rem;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        .datafast-widget .wpwl-form .wpwl-wrapper-cardNumber .wpwl-control {
          padding-right: 3.5rem;
        }

        /* ── Boton ──────────────────────────────────────────────────────────*/
        .datafast-widget .wpwl-form .wpwl-button {
          width: 100%;
          height: 3rem;
          border: none;
          border-radius: 0.625rem;
          background: var(--brand-primary, #0b5d1e);
          color: #fff;
          font-family: inherit;
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background-color 150ms ease, transform 100ms ease;
        }
        .datafast-widget .wpwl-form .wpwl-button:hover {
          background: var(--brand-primary-hover, #094d19);
        }
        .datafast-widget .wpwl-form .wpwl-button:active {
          transform: scale(0.99);
        }
        .datafast-widget .wpwl-form .wpwl-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .datafast-widget .wpwl-form .wpwl-button-pay::before {
          content: "";
        }

        /* ── Estados de error ───────────────────────────────────────────────*/
        .datafast-widget .wpwl-form .wpwl-hint {
          display: block;
          margin-top: 0.375rem;
          font-size: 0.75rem;
          line-height: 1.35;
          color: var(--status-error, #c0362c);
        }
        .datafast-widget .wpwl-form .wpwl-control-error,
        .datafast-widget .wpwl-form .wpwl-has-error {
          border-color: var(--status-error, #c0362c);
        }
        .datafast-widget .wpwl-form .wpwl-control-error:focus {
          box-shadow: 0 0 0 3px rgba(192, 54, 44, 0.12);
        }

        @media (max-width: 380px) {
          .datafast-widget .wpwl-form {
            grid-template-columns: minmax(0, 1fr);
          }
          .datafast-widget .wpwl-form .wpwl-group-expiry,
          .datafast-widget .wpwl-form .wpwl-group-cvv {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
}
