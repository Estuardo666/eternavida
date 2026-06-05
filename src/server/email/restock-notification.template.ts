import { escapeHtml } from "@/server/email/lib/escape-html";

function escape(str: string): string {
  return escapeHtml(str);
}

export function restockNotificationTemplate(input: {
  productName: string;
  productUrl: string;
}): string {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:#72B255;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">Dermatologika</h1>
      </div>

      <div style="padding:32px 24px;">
        <h2 style="font-size:20px;margin:0 0 16px;">¡Buenas noticias!</h2>
        <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 24px;">
          El producto que solicitaste ya está disponible nuevamente:
        </p>

        <div style="background:#f8f8f8;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
          <h3 style="font-size:18px;margin:0 0 8px;color:#333;">${escape(input.productName)}</h3>
          <p style="font-size:13px;color:#888;margin:0;">Stock disponible</p>
        </div>

        <div style="text-align:center;">
          <a href="${escape(input.productUrl)}"
             style="display:inline-block;background:#5bb446;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:600;">
            Ver producto
          </a>
        </div>

        <p style="font-size:12px;color:#999;margin:24px 0 0;text-align:center;">
          Recibes este correo porque te suscribiste para recibir notificaciones de disponibilidad.
        </p>
      </div>

      <div style="background:#f4faee;padding:20px 24px;text-align:center;font-size:12px;color:#888;">
        <p style="margin:0;">Dermatologika — Productos dermatológicos de confianza</p>
      </div>
    </div>
  `;
}
