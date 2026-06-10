import type { CartDataItem } from "@/types/abandoned-cart";
import { escapeHtml } from "@/server/email/lib/escape-html";

const priceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

function escape(str: string): string {
  return escapeHtml(str);
}

export function abandonedCartReminderTemplate(input: {
  items: CartDataItem[];
  cartUrl: string;
  step: number;
}): string {
  const itemsHtml = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #D9D2C5;font-size:14px;color:#2D2D2D;">
          ${escape(item.name)}
          <br><span style="font-size:12px;color:#9B927F;">${escape(item.brand)}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #D9D2C5;font-size:14px;color:#2D2D2D;text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #D9D2C5;font-size:14px;color:#2D2D2D;text-align:right;">
          ${priceFormatter.format((item.discountPrice ?? item.price) * item.quantity)}
        </td>
      </tr>`,
    )
    .join("");

  const total = input.items.reduce(
    (sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity,
    0,
  );

  const messages = [
    "Notamos que dejaste productos en tu carrito. ¡Todavía están disponibles!",
    "Tu carrito te está esperando. Los productos que seleccionaste siguen disponibles.",
    "Esta es tu última oportunidad. Los productos en tu carrito podrían agotarse pronto.",
  ];

  const message = (messages[input.step - 1] ?? messages[0]) as string;

  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#2D2D2D;">
      <div style="background:#0B5D1E;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">Eterna Vida</h1>
      </div>

      <div style="padding:32px 24px;">
        <h2 style="font-size:20px;margin:0 0 16px;">¿Olvidaste algo?</h2>
        <p style="font-size:14px;line-height:1.6;color:#6B6B6B;margin:0 0 24px;">
          ${escape(message)}
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="padding:10px 16px;text-align:left;font-size:12px;color:#9B927F;text-transform:uppercase;">Producto</th>
              <th style="padding:10px 16px;text-align:center;font-size:12px;color:#9B927F;text-transform:uppercase;">Cant.</th>
              <th style="padding:10px 16px;text-align:right;font-size:12px;color:#9B927F;text-transform:uppercase;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">Total</td>
              <td style="padding:12px 16px;font-size:14px;font-weight:600;text-align:right;">${priceFormatter.format(total)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align:center;">
          <a href="${escape(input.cartUrl)}"
             style="display:inline-block;background:#C58A1D;color:#0B5D1E;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:700;">
            Completar mi compra
          </a>
        </div>
      </div>

      <div style="background:#E8F2EA;padding:20px 24px;text-align:center;font-size:12px;color:#9B927F;">
        <p style="margin:0;">Eterna Vida — Bienestar natural para tu día a día</p>
      </div>
    </div>
  `;
}
