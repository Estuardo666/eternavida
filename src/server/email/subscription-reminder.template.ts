import { escapeHtml } from "@/server/email/lib/escape-html";

const priceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

function escape(str: string): string {
  return escapeHtml(str);
}

export function subscriptionReminderTemplate(input: {
  productName: string;
  productUrl: string;
  quantity: number;
  price: number;
  nextOrderDate: string;
}): string {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:#72B255;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">Dermatologika</h1>
      </div>

      <div style="padding:32px 24px;">
        <h2 style="font-size:20px;margin:0 0 16px;">Tu reposición está próxima</h2>
        <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 24px;">
          Tu suscripción de <strong>${escape(input.productName)}</strong> está programada para el ${escape(input.nextOrderDate)}.
        </p>

        <div style="background:#f8f8f8;border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="font-size:16px;font-weight:600;margin:0 0 8px;">${escape(input.productName)}</p>
          <p style="font-size:14px;color:#555;margin:0;">Cantidad: ${input.quantity} — ${priceFormatter.format(input.price * input.quantity)}</p>
        </div>

        <div style="text-align:center;">
          <a href="${escape(input.productUrl)}"
             style="display:inline-block;background:#5bb446;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:600;">
            Ver producto
          </a>
        </div>
      </div>

      <div style="background:#f4faee;padding:20px 24px;text-align:center;font-size:12px;color:#888;">
        <p style="margin:0;">Dermatologika — Productos dermatológicos de confianza</p>
      </div>
    </div>
  `;
}
