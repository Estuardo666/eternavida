import { escapeHtml } from "../lib/escape-html";
import { renderEmailLayout } from "./email-layout.template";

export function welcomeUserTemplate(user: {
  firstName: string;
  email: string;
}): string {
  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">
      ¡Bienvenida, ${escapeHtml(user.firstName)}!
    </h2>
    <p style="margin:0 0 20px;color:#4a4a4a;">
      Tu cuenta en Dermatologika ha sido creada con éxito. Nos alegra tenerte.
    </p>

    <div style="background:#f4faee;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 6px;font-size:13px;color:#737373;">Tu cuenta</p>
      <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;">${escapeHtml(user.email)}</p>
    </div>

    <p style="margin:0 0 16px;color:#4a4a4a;font-size:14px;">
      Ahora puedes:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#4a4a4a;font-size:14px;line-height:2;">
      <li>Ver y rastrear tus pedidos</li>
      <li>Guardar tus datos de envío</li>
      <li>Acceder a promociones exclusivas</li>
    </ul>

    <div style="text-align:center;margin-top:8px;">
      <a href="https://dermatologika.com/productos"
        style="display:inline-block;background-color:#72B255;color:#ffffff;font-size:15px;font-weight:600;padding:12px 32px;border-radius:50px;text-decoration:none;">
        Explorar productos
      </a>
    </div>
  `;

  return renderEmailLayout({
    title: "Bienvenida a Dermatologika",
    previewText: `¡Hola ${user.firstName}! Tu cuenta está lista. Empieza a explorar.`,
    contentHtml,
  });
}
