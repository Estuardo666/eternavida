import { escapeHtml } from "../lib/escape-html";
import { renderEmailLayout } from "./email-layout.template";

export function welcomeUserTemplate(user: {
  firstName: string;
  email: string;
}): string {
  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2D2D2D;">
      ¡Bienvenida, ${escapeHtml(user.firstName)}!
    </h2>
    <p style="margin:0 0 20px;color:#6B6B6B;">
      Tu cuenta en Eterna Vida ha sido creada con éxito. Nos alegra tenerte.
    </p>

    <div style="background:#E8F2EA;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 6px;font-size:13px;color:#9B927F;">Tu cuenta</p>
      <p style="margin:0;font-size:15px;font-weight:600;color:#2D2D2D;">${escapeHtml(user.email)}</p>
    </div>

    <p style="margin:0 0 16px;color:#6B6B6B;font-size:14px;">
      Ahora puedes:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#6B6B6B;font-size:14px;line-height:2;">
      <li>Ver y rastrear tus pedidos</li>
      <li>Guardar tus datos de envío</li>
      <li>Acceder a promociones exclusivas</li>
    </ul>

    <div style="text-align:center;margin-top:8px;">
      <a href="https://eternavida.com.ec/productos"
        style="display:inline-block;background:#C58A1D;color:#0B5D1E;font-size:15px;font-weight:700;padding:12px 32px;border-radius:50px;text-decoration:none;">
        Explorar productos
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "Bienvenida a Eterna Vida",
    previewText: `¡Hola ${user.firstName}! Tu cuenta está lista. Empieza a explorar.`,
    contentHtml,
  });
}
