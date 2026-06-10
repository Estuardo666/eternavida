import { escapeHtml, fmtPrice } from "../lib/escape-html";
import { renderEmailLayout } from "./email-layout.template";
import type { OrderWithItems } from "./order-confirmation.template";

export function orderAdminNotificationTemplate(order: OrderWithItems): string {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #D9D2C5;font-size:13px;color:#2D2D2D;">
          ${escapeHtml(item.name)} (${escapeHtml(item.brand)})
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #D9D2C5;font-size:13px;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #D9D2C5;font-size:13px;text-align:right;">${fmtPrice((item.discountPrice ?? item.price))}</td>
      </tr>`,
    )
    .join("");

  const customerEmail = order.guestEmail ?? "(registrado en Clerk)";

  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#2D2D2D;">Nuevo pedido recibido</h2>
    <p style="margin:0 0 20px;color:#6B6B6B;">Se ha creado un nuevo pedido en la tienda.</p>

    <div style="background:#E8F2EA;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:13px;color:#9B927F;">Número de pedido</td>
          <td style="font-size:16px;font-weight:700;color:#0B5D1E;text-align:right;">${escapeHtml(order.orderNumber)}</td>
        </tr>
        <tr>
          <td style="padding-top:8px;font-size:13px;color:#9B927F;">Total</td>
          <td style="padding-top:8px;font-size:16px;font-weight:700;color:#2D2D2D;text-align:right;">${fmtPrice(order.total)}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:#9B927F;text-transform:uppercase;letter-spacing:0.05em;">Cliente</h3>
    <p style="margin:0 0 4px;font-size:14px;color:#2D2D2D;">${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#6B6B6B;">${escapeHtml(customerEmail)}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6B6B6B;">${escapeHtml(order.phone)}</p>

    <h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:#9B927F;text-transform:uppercase;letter-spacing:0.05em;">Productos</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <th style="text-align:left;font-size:12px;color:#9B927F;padding-bottom:6px;">Producto</th>
        <th style="text-align:center;font-size:12px;color:#9B927F;padding-bottom:6px;">Cant.</th>
        <th style="text-align:right;font-size:12px;color:#9B927F;padding-bottom:6px;">Precio</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="2" style="padding-top:12px;font-size:14px;font-weight:700;color:#2D2D2D;border-top:2px solid #D9D2C5;">Total</td>
        <td style="padding-top:12px;font-size:14px;font-weight:700;color:#2D2D2D;text-align:right;border-top:2px solid #D9D2C5;">${fmtPrice(order.total)}</td>
      </tr>
    </table>

    <h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:#9B927F;text-transform:uppercase;letter-spacing:0.05em;">Dirección de envío</h3>
    <p style="margin:0 0 4px;font-size:14px;color:#2D2D2D;">${escapeHtml(order.address)}${order.apartment ? `, ${escapeHtml(order.apartment)}` : ""}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#6B6B6B;">${escapeHtml(order.city)}, ${escapeHtml(order.province)}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6B6B6B;">Método de pago: <strong>${escapeHtml(order.paymentMethodName)}</strong></p>
  `;

  return renderEmailLayout({
    title: `Nuevo pedido ${order.orderNumber}`,
    previewText: `Nuevo pedido de ${order.firstName} ${order.lastName} — ${fmtPrice(order.total)}`,
    contentHtml,
  });
}
