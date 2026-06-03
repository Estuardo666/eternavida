import type { Metadata } from "next";

import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page-layout";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso del sitio web y de compra en Dermatologika, conforme a la legislación vigente en la República del Ecuador.",
};

export default function TerminosYCondicionesPage() {
  return (
    <LegalPageLayout title="Términos y Condiciones" lastUpdated="1 de junio de 2025">
      <LegalSection title="1. Identificación de las partes">
        <p>
          Los presentes Términos y Condiciones regulan el acceso, uso y las relaciones comerciales
          entre <strong>Dermatologika</strong> (en adelante "la Empresa"), con domicilio en
          <strong> Loja, Ecuador</strong>, y cualquier persona natural o jurídica (en adelante "el Usuario")
          que acceda o realice compras a través del sitio web <strong>www.dermatologika.ec</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Aceptación de los términos">
        <p>
          El uso del sitio web y la realización de cualquier compra implica la aceptación plena
          e incondicional de estos Términos y Condiciones. Si no estás de acuerdo con alguno de
          los términos aquí establecidos, te pedimos que te abstengas de utilizar el sitio.
        </p>
        <p>
          Dermatologika se reserva el derecho de modificar estos términos en cualquier momento.
          Los cambios entrarán en vigor desde su publicación en el sitio web.
        </p>
      </LegalSection>

      <LegalSection title="3. Capacidad legal">
        <p>
          Para realizar compras en Dermatologika, el Usuario debe:
        </p>
        <LegalList
          items={[
            "Ser mayor de 18 años de edad o actuar bajo la representación legal de un adulto.",
            "Proporcionar información veraz, completa y actualizada al momento del registro y en cada compra.",
            "Mantener la confidencialidad de sus credenciales de acceso.",
          ]}
        />
        <p>
          La Empresa no se responsabiliza por el uso fraudulento de cuentas por parte de terceros
          no autorizados.
        </p>
      </LegalSection>

      <LegalSection title="4. Productos y precios">
        <p>
          Todos los precios publicados en el sitio web están expresados en <strong>dólares
          estadounidenses (USD)</strong>, moneda oficial de la República del Ecuador, e incluyen
          el <strong>Impuesto al Valor Agregado (IVA) del 15%</strong> vigente, salvo que se
          indique lo contrario.
        </p>
        <LegalList
          items={[
            "Dermatologika se reserva el derecho de modificar precios sin previo aviso.",
            "El precio válido de la compra es el que se muestra en el momento de confirmar el pedido.",
            "Los productos dermocosméticos son de uso externo y cosmético; no constituyen tratamientos médicos, diagnósticos ni terapias.",
            "Las descripciones e imágenes de los productos son orientativas y pueden variar levemente respecto al producto físico.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Proceso de compra y perfeccionamiento del contrato">
        <p>
          El contrato de compraventa entre el Usuario y Dermatologika se perfecciona en el
          momento en que la Empresa envía al cliente la <strong>confirmación del pedido</strong>
          por correo electrónico.
        </p>
        <p>
          Toda transacción estará respaldada por una <strong>factura electrónica</strong> emitida
          conforme a las disposiciones del <strong>Servicio de Rentas Internas (SRI)</strong> de
          Ecuador. La factura será enviada al correo electrónico registrado por el cliente.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilidad de productos">
        <p>
          La disponibilidad de los productos se muestra en tiempo real y está sujeta a los
          niveles de inventario existentes. En el caso excepcional de que un producto adquirido
          no esté disponible, Dermatologika se comunicará con el cliente para ofrecer una
          alternativa o proceder con el reembolso íntegro del valor pagado.
        </p>
      </LegalSection>

      <LegalSection title="7. Uso permitido del sitio web">
        <p>
          El Usuario se compromete a utilizar el sitio web de forma lícita y conforme a estos
          términos. Queda expresamente prohibido:
        </p>
        <LegalList
          items={[
            "Reproducir, distribuir o modificar el contenido del sitio sin autorización escrita de Dermatologika.",
            "Intentar acceder de forma no autorizada a sistemas o bases de datos de la Empresa.",
            "Utilizar el sitio para fines comerciales no autorizados o fraudulentos.",
            "Publicar contenido falso, ofensivo o que vulnere derechos de terceros.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Propiedad intelectual">
        <p>
          Todo el contenido del sitio web —incluyendo, pero no limitado a: marca, logotipo,
          imágenes, textos, diseño gráfico y código fuente— es propiedad exclusiva de
          Dermatologika o de sus licenciantes, y se encuentra protegido por la legislación
          ecuatoriana de propiedad intelectual vigente (Ley Orgánica de Economía Popular y
          Solidaria y Código Orgánico de la Economía Social de los Conocimientos). Queda
          prohibida su reproducción total o parcial sin autorización expresa.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitación de responsabilidad">
        <p>
          Dermatologika no se responsabiliza por:
        </p>
        <LegalList
          items={[
            "El uso incorrecto de los productos adquiridos en el sitio.",
            "Reacciones adversas derivadas del uso de productos sin previa consulta dermatológica.",
            "Interrupciones del servicio por causas de fuerza mayor, mantenimiento o fallas técnicas ajenas a la Empresa.",
            "Daños indirectos o consecuentes derivados del uso del sitio.",
          ]}
        />
        <p>
          Las recomendaciones e información publicada en el sitio son de carácter orientativo.
          Siempre consulte a un profesional de la salud o dermatólogo para diagnósticos y
          tratamientos específicos.
        </p>
      </LegalSection>

      <LegalSection title="10. Jurisdicción y ley aplicable">
        <p>
          Estos Términos y Condiciones se rigen por las leyes de la <strong>República del
          Ecuador</strong>, incluyendo la Ley Orgánica de Defensa del Consumidor, el Código de
          Comercio y demás normativa aplicable al comercio electrónico.
        </p>
        <p>
          Para la resolución de cualquier controversia derivada de la interpretación o
          ejecución de estos términos, las partes se someten a la jurisdicción de los
          <strong> Jueces competentes de la ciudad de Quito, Ecuador</strong>, renunciando
          expresamente a cualquier otro fuero que pudiera corresponderles.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Para cualquier consulta relacionada con estos Términos y Condiciones:
        </p>
        <LegalList
          items={[
            "Correo electrónico: info@dermatologika.ec",
            "Teléfono: 098 274 0049",
            "Dirección: Av. Jose Maria Vivar, Castro, Loja, Ecuador.",
            "WhatsApp: disponible en nuestro sitio web.",
          ]}
        />
      </LegalSection>
    </LegalPageLayout>
  );
}
