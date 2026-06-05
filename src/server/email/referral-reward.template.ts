import { escapeHtml } from "@/server/email/lib/escape-html";

function escape(str: string): string {
  return escapeHtml(str);
}

export function referralRewardTemplate(input: {
  couponCode: string;
  rewardDescription: string;
}): string {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background:#72B255;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">Dermatologika</h1>
      </div>

      <div style="padding:32px 24px;">
        <h2 style="font-size:20px;margin:0 0 16px;">¡Tu recompensa está lista!</h2>
        <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 24px;">
          Gracias por referir a un amigo. Aquí está tu recompensa:
        </p>

        <div style="background:#f4faee;border:2px dashed #72B255;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="font-size:12px;color:#888;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Tu cupón</p>
          <p style="font-size:28px;font-weight:700;color:#72B255;margin:0 0 8px;letter-spacing:0.05em;">${escape(input.couponCode)}</p>
          <p style="font-size:14px;color:#555;margin:0;">${escape(input.rewardDescription)}</p>
        </div>

        <div style="text-align:center;">
          <a href="${escape(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dermatologika.com")}/productos"
             style="display:inline-block;background:#5bb446;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:600;">
            Usar mi cupón
          </a>
        </div>
      </div>

      <div style="background:#f4faee;padding:20px 24px;text-align:center;font-size:12px;color:#888;">
        <p style="margin:0;">Dermatologika — Productos dermatológicos de confianza</p>
      </div>
    </div>
  `;
}
