export function renderEmailLayout(opts: {
  title: string;
  previewText: string;
  contentHtml: string;
}): string {
  const { title, previewText, contentHtml } = opts;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF8F3; font-family: Arial, Helvetica, sans-serif; }
    .preview { display: none; max-height: 0; overflow: hidden; mso-hide: all; }
    a { color: #0B5D1E; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .content-pad { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F3;">
  <div class="preview" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF8F3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0B5D1E;padding:28px 32px;text-align:center;">
              <img src="https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/media/logotipo%20para%20correos.png"
                alt="Eterna Vida" width="140" style="width:140px;height:auto;display:block;margin:0 auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="content-pad" style="padding:32px 36px;color:#2D2D2D;font-size:15px;line-height:1.65;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#E8F2EA;padding:20px 36px;text-align:center;border-top:1px solid #D9D2C5;">
              <p style="margin:0 0 6px;font-size:12px;color:#9B927F;">
                Eterna Vida — Bienestar natural para tu día a día
              </p>
              <p style="margin:0 0 6px;font-size:12px;color:#9B927F;">
                Ecuador &bull; <a href="https://eternavida.com.ec" style="color:#0B5D1E;">eternavida.com.ec</a>
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                Recibiste este correo porque realizaste una compra o te registraste en nuestro sitio.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
