import type { Metadata } from "next";

import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo Eterna Vida recopila, trata y protege tus datos personales, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP).",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" lastUpdated="1 de junio de 2025">
      <LegalSection title="1. Marco legal">
        <p>
          Esta Política de Privacidad se rige por la <strong>Ley Orgánica de Protección de
          Datos Personales del Ecuador (LOPDP)</strong>, publicada el 26 de mayo de 2021 en el
          Registro Oficial, y sus reglamentos de aplicación. Eterna Vida actúa como
          <strong> responsable del tratamiento</strong> de los datos personales de sus clientes y
          usuarios.
        </p>
      </LegalSection>

      <LegalSection title="2. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es <strong>Eterna Vida</strong>,
          con domicilio en <strong>Vilcabamba, Loja, Ecuador</strong>. Para cualquier consulta relacionada con el
          tratamiento de tus datos personales, puedes contactarnos en:
          <strong> privacidad@eternavida.com.ec</strong>
        </p>
        <p>
          También puedes contactarnos al teléfono <strong>098 815 8964</strong> o visitarnos en
          <strong> Vilcabamba, Loja, Ecuador</strong>.
        </p>
      </LegalSection>

      <LegalSection title="3. Datos personales que recopilamos">
        <p>Recopilamos los siguientes datos personales cuando interactúas con nuestro sitio:</p>
        <LegalList
          items={[
            "Nombre completo.",
            "Dirección de correo electrónico.",
            "Número de teléfono o celular.",
            "Dirección de entrega (provincia, ciudad, calle, número, referencia).",
            "Historial de pedidos y productos adquiridos.",
            "Datos de navegación: páginas visitadas, tiempo de sesión, dirección IP y tipo de dispositivo (a través de cookies y herramientas de analítica).",
          ]}
        />
        <p>
          No recopilamos datos sensibles conforme a la definición del Art. 23 de la LOPDP,
          tales como datos de salud, biométricos o de orientación sexual.
        </p>
      </LegalSection>

      <LegalSection title="4. Finalidad del tratamiento">
        <p>Tus datos personales son tratados con las siguientes finalidades:</p>
        <LegalList
          items={[
            "Procesamiento, gestión y entrega de tus pedidos.",
            "Emisión de facturas electrónicas conforme a las obligaciones tributarias del SRI.",
            "Comunicaciones transaccionales: confirmación de pedido, estado de envío y atención al cliente.",
            "Envío de comunicaciones comerciales y promocionales (únicamente con tu consentimiento previo y expreso).",
            "Mejora continua del servicio, análisis estadístico y personalización de la experiencia de usuario.",
            "Cumplimiento de obligaciones legales aplicables.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Base legal del tratamiento">
        <p>El tratamiento de tus datos personales se sustenta en las siguientes bases legales:</p>
        <LegalList
          items={[
            "Ejecución del contrato de compraventa (Art. 24 numeral 2 de la LOPDP).",
            "Cumplimiento de obligaciones legales, como la facturación electrónica exigida por el SRI (Art. 24 numeral 3 de la LOPDP).",
            "Consentimiento libre, específico, informado e inequívoco del titular para comunicaciones comerciales (Art. 24 numeral 1 de la LOPDP).",
            "Interés legítimo para el análisis de seguridad y mejora del servicio.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Transferencia y comunicación de datos">
        <p>
          Eterna Vida podrá compartir tus datos personales únicamente con los siguientes
          terceros y en la medida estrictamente necesaria:
        </p>
        <LegalList
          items={[
            "Operadores logísticos y empresas de mensajería, para la entrega de pedidos.",
            "Procesadores de pago, para la gestión segura de transacciones.",
            "Servicios de analítica web (Google Analytics u otros), bajo medidas contractuales de protección.",
            "Autoridades competentes, cuando exista una obligación legal de comunicación.",
          ]}
        />
        <p>
          <strong>Eterna Vida no vende, alquila ni cede tus datos personales a terceros con
          fines comerciales propios.</strong>
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos (Derechos ARCO y complementarios)">
        <p>
          De conformidad con la LOPDP, tienes los siguientes derechos respecto a tus datos personales:
        </p>
        <LegalList
          items={[
            "Acceso: conocer qué datos personales tuyos están siendo tratados y con qué finalidad.",
            "Rectificación: solicitar la corrección de datos inexactos, desactualizados o incompletos.",
            "Supresión o cancelación: solicitar la eliminación de tus datos cuando ya no sean necesarios para los fines que motivaron su recopilación, salvo obligación legal de conservación.",
            "Oposición: oponerte al tratamiento de tus datos para finalidades específicas, incluyendo el marketing directo.",
            "Portabilidad: recibir tus datos en un formato estructurado y de uso común.",
            "Revocación del consentimiento: retirar en cualquier momento el consentimiento otorgado, sin que ello afecte la licitud del tratamiento previo.",
          ]}
        />
        <p>
          Para ejercer cualquiera de estos derechos, envía tu solicitud a
          <strong> privacidad@eternavida.com.ec</strong> indicando tu nombre completo, el derecho
          que deseas ejercer y cualquier información que facilite la localización de tus datos.
          Responderemos en un plazo máximo de <strong>15 días hábiles</strong>.
        </p>
      </LegalSection>

      <LegalSection title="8. Conservación de datos">
        <p>
          Tus datos personales serán conservados durante el tiempo necesario para cumplir con
          las finalidades descritas o mientras exista una obligación legal de conservación
          (por ejemplo, 7 años para documentos tributarios según el Código Tributario ecuatoriano).
          Transcurrido dicho plazo, los datos serán suprimidos o anonimizados de forma segura.
        </p>
      </LegalSection>

      <LegalSection title="9. Seguridad de la información">
        <p>
          Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos
          personales frente a accesos no autorizados, pérdida, destrucción o alteración, tales como:
        </p>
        <LegalList
          items={[
            "Cifrado de datos en tránsito mediante protocolo HTTPS.",
            "Acceso restringido a datos personales únicamente al personal autorizado.",
            "Procedimientos de gestión de incidentes de seguridad.",
            "Evaluaciones periódicas de seguridad de los sistemas.",
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Cookies y tecnologías de rastreo">
        <p>
          Nuestro sitio utiliza cookies propias y de terceros para:
        </p>
        <LegalList
          items={[
            "Garantizar el funcionamiento técnico del sitio (cookies esenciales).",
            "Analizar el comportamiento de navegación y mejorar la experiencia del usuario (cookies analíticas).",
            "Mostrar contenido personalizado (cookies de personalización).",
          ]}
        />
        <p>
          Puedes gestionar o deshabilitar las cookies desde la configuración de tu navegador.
          La desactivación de cookies esenciales puede afectar el funcionamiento del sitio.
        </p>
      </LegalSection>

      <LegalSection title="11. Menores de edad">
        <p>
          El sitio web de Eterna Vida no está dirigido a personas menores de 18 años.
          No recopilamos intencionalmente datos personales de menores de edad. Si tienes
          conocimiento de que un menor ha proporcionado datos personales sin autorización del
          representante legal, comunícate con nosotros para proceder a su eliminación inmediata.
        </p>
      </LegalSection>

      <LegalSection title="12. Actualizaciones de esta política">
        <p>
          Eterna Vida se reserva el derecho de actualizar esta Política de Privacidad en
          cualquier momento para reflejar cambios normativos, operativos o de servicio. La
          versión vigente estará siempre disponible en nuestro sitio web con la fecha de la
          última actualización. Te recomendamos revisarla periódicamente.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
