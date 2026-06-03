import type { Metadata } from "next";

import { LegalPageLayout, LegalSection, LegalList } from "@/components/layout/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de Envíos",
  description:
    "Conoce nuestras condiciones de envío, tiempos de entrega y operadores logísticos para entregas en todo el Ecuador.",
};

export default function PoliticaDeEnviosPage() {
  return (
    <LegalPageLayout title="Política de Envíos" lastUpdated="1 de junio de 2025">
      <LegalSection title="1. Cobertura de envíos">
        <p>
          Realizamos envíos a todo el territorio ecuatoriano, incluyendo la región Sierra, Costa,
          Amazonía y las Islas Galápagos. La disponibilidad y los tiempos de entrega pueden variar
          según la ubicación de destino.
        </p>
      </LegalSection>

      <LegalSection title="2. Tiempos de entrega">
        <p>Los tiempos estimados de entrega son los siguientes, contados desde la confirmación del pago:</p>
        <LegalList
          items={[
            "Quito, Guayaquil y Cuenca: 1 a 2 días hábiles.",
            "Otras ciudades principales (Ambato, Loja, Manta, Portoviejo, Ibarra, Santo Domingo): 2 a 3 días hábiles.",
            "Localidades rurales, cantones alejados y zonas de difícil acceso: 4 a 7 días hábiles.",
            "Islas Galápagos: 7 a 12 días hábiles, sujeto a disponibilidad de transporte aéreo.",
          ]}
        />
        <p>
          Estos tiempos son referenciales y pueden verse afectados por condiciones climáticas,
          feriados nacionales o eventos de fuerza mayor.
        </p>
      </LegalSection>

      <LegalSection title="3. Costos de envío">
        <p>Los costos de envío se calculan de la siguiente manera:</p>
        <LegalList
          items={[
            "Envío gratuito en compras iguales o superiores a $50.00 USD (zona urbana continental).",
            "Compras menores a $50.00 USD: $3.99 USD para zonas urbanas.",
            "Localidades rurales y zonas de difícil acceso: $5.99 USD.",
            "Galápagos: consultar costo al momento de la compra.",
          ]}
        />
        <p>
          El costo de envío se mostrará de forma clara antes de confirmar tu pedido.
        </p>
      </LegalSection>

      <LegalSection title="4. Operadores logísticos">
        <p>
          Trabajamos con operadores logísticos certificados en Ecuador, principalmente
          Servientrega, Tramaco Express y Laar Courier, seleccionados según la zona de destino
          para garantizar la mejor cobertura y tiempos de entrega.
        </p>
        <p>
          Una vez despachado tu pedido, recibirás un correo electrónico con el número de guía
          y el enlace de rastreo del operador correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="5. Despacho y procesamiento">
        <p>
          Los pedidos con pago confirmado son procesados y despachados dentro de las siguientes
          24 a 48 horas hábiles. Los pedidos realizados los días viernes después de las 14h00,
          sábados, domingos o feriados nacionales serán procesados el siguiente día hábil.
        </p>
      </LegalSection>

      <LegalSection title="6. Manejo especial de dermocosméticos">
        <p>
          Nuestros productos dermocosméticos requieren condiciones especiales de almacenamiento
          y transporte. Empacamos todos los pedidos con materiales de protección adecuados para
          preservar la integridad del producto durante el trayecto. Si recibes un producto dañado
          debido al transporte, contáctanos de inmediato para gestionar su reposición.
        </p>
      </LegalSection>

      <LegalSection title="7. Dirección de entrega">
        <p>
          El cliente es responsable de proporcionar una dirección de entrega correcta y completa.
          Dermatologika no se hace responsable por demoras o entregas fallidas causadas por
          información incorrecta proporcionada por el comprador. En caso de entrega fallida por
          ausencia del destinatario, el operador logístico intentará una segunda entrega o
          dejará aviso para retiro en la agencia más cercana.
        </p>
      </LegalSection>

      <LegalSection title="8. Contacto">
        <p>
          Para consultas relacionadas con el estado de tu pedido o cualquier inconveniente en
          la entrega, comunícate con nosotros a través de:
        </p>
        <LegalList
          items={[
            "Correo electrónico: envios@dermatologika.ec",
            "Teléfono: 098 274 0049",
            "Dirección: Av. Jose Maria Vivar, Castro, Loja, Ecuador.",
            "WhatsApp: disponible en nuestro sitio web.",
          ]}
        />
      </LegalSection>
    </LegalPageLayout>
  );
}
