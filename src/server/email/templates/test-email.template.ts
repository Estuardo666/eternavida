import { renderEmailLayout } from "./email-layout.template";

export function testEmailTemplate(): string {
  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#2D2D2D;">Correo de prueba</h2>
    <p style="margin:0 0 16px;color:#6B6B6B;">
      Este es un correo de prueba enviado desde el panel de administración de Eterna Vida.
    </p>
    <div style="background:#E8F2EA;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
      <p style="margin:0;font-size:14px;color:#6B6B6B;">
        ✓ Conexión con Resend: <strong style="color:#2e8b57;">OK</strong>
      </p>
    </div>
    <p style="margin:0;font-size:13px;color:#9B927F;">
      Enviado el ${new Date().toLocaleString("es-EC", { timeZone: "America/Guayaquil" })}
    </p>
  `;

  return renderEmailLayout({
    title: "Correo de prueba — Eterna Vida",
    previewText: "Prueba de conexión con Resend — todo OK",
    contentHtml,
  });
}
