import type { Metadata } from "next";

import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de Devoluciones y Cancelaciones",
  description:
    "Información sobre nuestro proceso de devoluciones, cambios y cancelaciones de pedidos, conforme a la Ley Orgánica de Defensa del Consumidor del Ecuador.",
};

export default function PoliticaDevolucionesPage() {
  return (
    <LegalPageLayout
      title="Política de Devoluciones y Cancelaciones"
      lastUpdated="1 de junio de 2025"
    >
      <LegalSection title="1. Marco legal">
        <p>
          Esta política se rige por la <strong>Ley Orgánica de Defensa del Consumidor del Ecuador
          (LODC)</strong> y el Reglamento de Comercio Electrónico vigente. Dermatologika garantiza
          los derechos del consumidor establecidos en dicha normativa.
        </p>
      </LegalSection>

      <LegalSection title="2. Devoluciones por producto defectuoso o dañado">
        <p>
          Conforme al Art. 28 de la LODC, si recibes un producto defectuoso, en mal estado o que
          no corresponde a lo descrito en nuestro sitio, tienes derecho a solicitar:
        </p>
        <LegalList
          items={[
            "La sustitución del producto por uno de las mismas características.",
            "La reparación del producto cuando sea aplicable.",
            "La devolución del valor íntegro pagado, incluyendo costos de envío originales.",
          ]}
        />
        <p>
          Dispones de <strong>15 días hábiles</strong> contados desde la fecha de recepción del
          pedido para reportar el inconveniente. El costo del envío de retorno en estos casos
          es asumido íntegramente por Dermatologika.
        </p>
      </LegalSection>

      <LegalSection title="3. Devoluciones por cambio de opinión">
        <p>
          Aceptamos devoluciones por cambio de opinión en las siguientes condiciones:
        </p>
        <LegalList
          items={[
            "Plazo máximo: 5 días hábiles desde la recepción del producto.",
            "El producto debe encontrarse en su empaque original, sin abrir y sin señales de uso.",
            "El costo del envío de retorno es responsabilidad del cliente.",
            "El reembolso se procesará una vez recibido e inspeccionado el producto.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Productos excluidos de devolución">
        <p>
          Por razones sanitarias y de salud pública, no se aceptan devoluciones en los
          siguientes casos:
        </p>
        <LegalList
          items={[
            "Productos de higiene personal o dermocosméticos que hayan sido abiertos o utilizados.",
            "Productos con envase roto o sin sello de seguridad original.",
            "Productos adquiridos en promociones especiales o liquidaciones, salvo defecto de fabricación.",
            "Muestras gratuitas o productos de regalo.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Cancelación de pedidos">
        <p>
          Puedes cancelar tu pedido bajo las siguientes condiciones:
        </p>
        <LegalList
          items={[
            "Pedidos pendientes de despacho: cancelación gratuita dentro de las primeras 24 horas hábiles tras la confirmación del pago.",
            "Pedidos ya despachados: no es posible la cancelación; deberás seguir el proceso de devolución una vez recibido el producto.",
            "Pedidos con pago pendiente de confirmación: pueden cancelarse en cualquier momento antes de que el pago sea acreditado.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Proceso de devolución paso a paso">
        <p>Para iniciar una devolución o cancelación, sigue estos pasos:</p>
        <LegalList
          items={[
            "Contacta a nuestro equipo en devoluciones@dermatologika.ec indicando: número de pedido, motivo de la devolución y fotografías del producto (si aplica).",
            "Nuestro equipo revisará tu solicitud y te responderá en un máximo de 2 días hábiles con las instrucciones de retorno.",
            "Envía el producto según las instrucciones recibidas. Conserva el comprobante de envío.",
            "Una vez recibido e inspeccionado el producto, se procesará el reembolso o cambio.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Plazos de reembolso">
        <p>
          Los reembolsos aprobados serán procesados en un plazo de <strong>5 a 10 días hábiles</strong>,
          acreditándose al mismo método de pago utilizado en la compra original. Los tiempos pueden
          variar según el banco o procesador de pagos del cliente.
        </p>
      </LegalSection>

      <LegalSection title="8. Contacto">
        <p>
          Para cualquier consulta relacionada con devoluciones o cancelaciones, comunícate con nosotros:
        </p>
        <LegalList
          items={[
            "Correo electrónico: devoluciones@dermatologika.ec",
            "Teléfono: 098 274 0049",
            "Dirección: Av. Jose Maria Vivar, Castro, Loja, Ecuador.",
            "WhatsApp: disponible en nuestro sitio web.",
            "Horario de atención: lunes a viernes, 09h00 a 17h00 (hora Ecuador).",
          ]}
        />
      </LegalSection>
    </LegalPageLayout>
  );
}
