import { escapeHtml } from "../lib/escape-html";
import { renderEmailLayout } from "./email-layout.template";

export type ContactLead = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  message: string;
  source: string;
  createdAt: Date | string;
};

export function contactLeadNotificationTemplate(lead: ContactLead): string {
  const contentHtml = `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#2D2D2D;">Nuevo lead recibido</h2>
    <p style="margin:0 0 20px;color:#6B6B6B;">Un visitante ha enviado un mensaje de contacto.</p>

    <div style="background:#E8F2EA;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:13px;color:#9B927F;padding-bottom:6px;">Nombre</td>
          <td style="font-size:14px;font-weight:600;color:#2D2D2D;text-align:right;">${escapeHtml(lead.fullName)}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#9B927F;padding-bottom:6px;">Email</td>
          <td style="font-size:14px;color:#2D2D2D;text-align:right;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#0B5D1E;">${escapeHtml(lead.email)}</a></td>
        </tr>
        ${lead.phone ? `
        <tr>
          <td style="font-size:13px;color:#9B927F;padding-bottom:6px;">Teléfono</td>
          <td style="font-size:14px;color:#2D2D2D;text-align:right;">${escapeHtml(lead.phone)}</td>
        </tr>` : ""}
        <tr>
          <td style="font-size:13px;color:#9B927F;padding-bottom:6px;">Fuente</td>
          <td style="font-size:14px;color:#6B6B6B;text-align:right;">${escapeHtml(lead.source)}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:#9B927F;text-transform:uppercase;letter-spacing:0.05em;">Mensaje</h3>
    <div style="background:#f8f8f8;border-left:3px solid #0B5D1E;border-radius:0 6px 6px 0;padding:14px 16px;font-size:14px;color:#2D2D2D;line-height:1.6;">
      ${escapeHtml(lead.message)}
    </div>
  `;

  return renderEmailLayout({
    title: "Nuevo lead — Eterna Vida",
    previewText: `Nuevo mensaje de ${lead.fullName} (${lead.email})`,
    contentHtml,
  });
}
