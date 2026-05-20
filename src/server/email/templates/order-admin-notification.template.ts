import { escapeHtml, fmtPrice } from "../lib/escape-html";
import { renderEmailLayout } from "./email-layout.template";
import type { OrderWithItems } from "./order-confirmation.template";

export function orderAdminNotificationTemplate(order: OrderWithItems): string {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e8f0e5;font-size:13px;color:#1a1a1a;">
          ${escapeHtml(item.name)} (${escapeHtml(item.brand)})
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e8f0e5;font-size:13px;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e8f0e5;font-size:13px;text-align:right;">${fmtPrice((item.discountPrice ?? item.price))}</td>
      </tr>`,
    )
    .join("");

  const customerEmail = order.guestEmail ?? "(registrado en Clerk)";

  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">Nuevo pedido recibido</h2>
    <p style="margin:0 0 20px;color:#4a4a4a;">Se ha creado un nuevo pedido en la tienda.</p>

    <div style="background:#f4faee;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:13px;color:#737373;">Número de pedido</td>
          <td style="font-size:16px;font-weight:700;color:#72B255;text-align:right;">${escapeHtml(order.orderNumber)}</td>
        </tr>
        <tr>
          <td style="padding-top:8px;font-size:13px;color:#737373;">Total</td>
          <td style="padding-top:8px;font-size:16px;font-weight:700;color:#1a1a1a;text-align:right;">${fmtPrice(order.total)}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:#737373;text-transform:uppercase;letter-spacing:0.05em;">Cliente</h3>
    <p style="margin:0 0 4px;font-size:14px;color:#1a1a1a;">${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#4a4a4a;">${escapeHtml(customerEmail)}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#4a4a4a;">${escapeHtml(order.phone)}</p>

    <h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:#737373;text-transform:uppercase;letter-spacing:0.05em;">Productos</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <th style="text-align:left;font-size:12px;color:#737373;padding-bottom:6px;">Producto</th>
        <th style="text-align:center;font-size:12px;color:#737373;padding-bottom:6px;">Cant.</th>
        <th style="text-align:right;font-size:12px;color:#737373;padding-bottom:6px;">Precio</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="2" style="padding-top:12px;font-size:14px;font-weight:700;color:#1a1a1a;border-top:2px solid #e0ecda;">Total</td>
        <td style="padding-top:12px;font-size:14px;font-weight:700;color:#1a1a1a;text-align:right;border-top:2px solid #e0ecda;">${fmtPrice(order.total)}</td>
      </tr>
    </table>

    <h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:#737373;text-transform:uppercase;letter-spacing:0.05em;">Dirección de envío</h3>
    <p style="margin:0 0 4px;font-size:14px;color:#1a1a1a;">${escapeHtml(order.address)}${order.apartment ? `, ${escapeHtml(order.apartment)}` : ""}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#4a4a4a;">${escapeHtml(order.city)}, ${escapeHtml(order.province)}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#4a4a4a;">Método de pago: <strong>${escapeHtml(order.paymentMethodName)}</strong></p>
  `;

  return renderEmailLayout({
    title: `Nuevo pedido ${order.orderNumber}`,
    previewText: `Nuevo pedido de ${order.firstName} ${order.lastName} — ${fmtPrice(order.total)}`,
    contentHtml,
  });
}
