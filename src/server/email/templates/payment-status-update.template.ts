import type { Order, PaymentStatus } from "@prisma/client";

import { escapeHtml, fmtPrice } from "../lib/escape-html";
import { renderEmailLayout } from "./email-layout.template";

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  failed: "Fallido",
  refunded: "Reembolsado",
  partially_refunded: "Reembolso parcial",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "#7a6830",
  paid: "#2f6d44",
  failed: "#c0392b",
  refunded: "#2d5fa7",
  partially_refunded: "#8b5a1e",
};

export function paymentStatusUpdateTemplate(
  order: Order,
  oldStatus: PaymentStatus,
  newStatus: PaymentStatus,
): string {
  const newLabel = PAYMENT_STATUS_LABELS[newStatus];
  const color = PAYMENT_STATUS_COLORS[newStatus];
  const previewText =
    newStatus === "refunded"
      ? `El reembolso de tu pedido ${order.orderNumber} fue procesado.`
      : `El pago de tu pedido ${order.orderNumber} fue actualizado.`;

  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">Actualización de pago</h2>
    <p style="margin:0 0 24px;color:#4a4a4a;">
      Hola <strong>${escapeHtml(order.firstName)}</strong>, el estado de pago de tu pedido cambió.
    </p>

    <div style="background:#f4faee;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#737373;">Pedido</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1a1a1a;">${escapeHtml(order.orderNumber)}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8f0e5;font-size:14px;color:#737373;">Estado anterior</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8f0e5;font-size:14px;color:#4a4a4a;text-align:right;">${PAYMENT_STATUS_LABELS[oldStatus]}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:15px;font-weight:600;color:#1a1a1a;">Nuevo estado</td>
        <td style="padding:12px 0 0;text-align:right;">
          <span style="background-color:${color}1a;color:${color};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">
            ${newLabel}
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#4a4a4a;">Total del pedido: <strong>${fmtPrice(order.total)}</strong></p>
  `;

  return renderEmailLayout({
    title: `Pedido ${order.orderNumber} — ${newLabel}`,
    previewText,
    contentHtml,
  });
}
