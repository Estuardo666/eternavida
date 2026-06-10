import { escapeHtml, fmtPrice } from "../lib/escape-html";
import { renderEmailLayout } from "./email-layout.template";
import type { Order, OrderItem } from "@prisma/client";

export type OrderWithItems = Order & { items: OrderItem[] };

export function orderConfirmationTemplate(order: OrderWithItems): string {
  const isPendingPayment = order.status === "pending";
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #D9D2C5;font-size:14px;color:#2D2D2D;">
          ${escapeHtml(item.name)} <span style="color:#9B927F;">x${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #D9D2C5;font-size:14px;color:#2D2D2D;text-align:right;">
          ${fmtPrice((item.discountPrice ?? item.price).toNumber() * item.quantity)}
        </td>
      </tr>`,
    )
    .join("");
  const pendingPaymentBlock = isPendingPayment
    ? `
    <div style="background:#FAF8F3;border:1px solid #C58A1D;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:#7a4b11;font-weight:600;">
        Tu pedido está pendiente de pago. Por favor envía el comprobante de tu transferencia para que podamos procesarlo.
      </p>
    </div>`
    : "";
  const emailTitle = isPendingPayment
    ? "Pedido recibido — pendiente de pago"
    : `Pedido ${order.orderNumber} recibido — Eterna Vida`;
  const previewText = isPendingPayment
    ? "Tu pedido fue recibido y está pendiente de pago."
    : `Gracias por tu compra. Total: ${fmtPrice(order.total)}`;

  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2D2D2D;">¡Gracias por tu pedido!</h2>
    <p style="margin:0 0 24px;color:#6B6B6B;">
      Hola <strong>${escapeHtml(order.firstName)}</strong>, hemos recibido tu pedido con éxito.
    </p>
    ${pendingPaymentBlock}

    <div style="background:#E8F2EA;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#9B927F;">Número de pedido</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0B5D1E;">${escapeHtml(order.orderNumber)}</p>
    </div>

    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#2D2D2D;">Productos</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${itemRows}
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#6B6B6B;">Subtotal</td>
        <td style="padding:10px 0;font-size:14px;color:#6B6B6B;text-align:right;">${fmtPrice(order.subtotal)}</td>
      </tr>
      ${order.shippingCost.toNumber() > 0 ? `
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#6B6B6B;">Envío (${escapeHtml(order.shippingMethodName)})</td>
        <td style="padding:4px 0;font-size:14px;color:#6B6B6B;text-align:right;">${fmtPrice(order.shippingCost)}</td>
      </tr>` : ""}
      ${order.discountAmount.toNumber() > 0 ? `
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#2e8b57;">Descuento</td>
        <td style="padding:4px 0;font-size:14px;color:#2e8b57;text-align:right;">-${fmtPrice(order.discountAmount)}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#2D2D2D;border-top:2px solid #D9D2C5;">Total</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#2D2D2D;text-align:right;border-top:2px solid #D9D2C5;">${fmtPrice(order.total)}</td>
      </tr>
    </table>

    <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#2D2D2D;">Dirección de entrega</h3>
    <p style="margin:0 0 4px;font-size:14px;color:#6B6B6B;">${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#6B6B6B;">${escapeHtml(order.address)}${order.apartment ? `, ${escapeHtml(order.apartment)}` : ""}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#6B6B6B;">${escapeHtml(order.city)}, ${escapeHtml(order.province)}</p>
    <p style="margin:0 0 24px;font-size:14px;color:#6B6B6B;">${escapeHtml(order.phone)}</p>

    <p style="margin:0;font-size:14px;color:#6B6B6B;">
      Método de pago: <strong>${escapeHtml(order.paymentMethodName)}</strong>
    </p>
  `;

  return renderEmailLayout({
    title: emailTitle,
    previewText,
    contentHtml,
  });
}
