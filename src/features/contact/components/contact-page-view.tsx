import {
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const businessHours = [
  { day: "Lunes", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Martes", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Miércoles", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Jueves", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Viernes", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Sábado", hours: "8:00 a. m. - 6:00 p. m." },
  { day: "Domingo", hours: "Cerrado" },
] as const;

const mapEmbedUrl =
  "https://www.google.com/maps?q=-3.995121259388611,-79.1971842368048&z=17&output=embed";

export function ContactPageView() {
  return (
    <section className="container py-8 sm:py-12 lg:py-16">
      <div className="overflow-hidden rounded-[32px] border border-border-soft bg-surface-canvas shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="space-y-6 bg-surface-soft p-6 sm:p-8 lg:p-10">
            <span className="inline-flex rounded-pill border border-border-brand bg-surface-brandTint px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
              Contacto
            </span>

            <div className="space-y-3">
              <h1 className="text-headline-sm text-text-primary sm:text-headline-md">
                Agenda tu visita en Dermatologika
              </h1>
              <p className="max-w-prose text-body-md text-text-secondary">
                Brindamos atención dermatológica especializada en Loja, Ecuador. Escríbenos o
                llámanos para resolver tus dudas y coordinar tu visita.
              </p>
            </div>

            <div className="space-y-5">
              <article className="space-y-2">
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Dirección
                </h2>
                <div className="flex items-start gap-3 text-body-sm text-text-primary">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
                  <p>Clodoveo Jaramillo y Virgilio Abarca, Loja, Ecuador</p>
                </div>
              </article>

              <article className="space-y-3">
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Teléfonos
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="tel:+593958654000"
                    className="inline-flex items-start gap-2 rounded-md border border-border bg-surface-canvas p-3 text-body-sm text-text-primary transition hover:border-border-brand"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                    <span>095 865 4000</span>
                  </a>
                  <a
                    href="tel:+593982740049"
                    className="inline-flex items-start gap-2 rounded-md border border-border bg-surface-canvas p-3 text-body-sm text-text-primary transition hover:border-border-brand"
                  >
                    <MessageCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                      aria-hidden="true"
                    />
                    <span>098 274 0049</span>
                  </a>
                </div>
              </article>

              <article className="space-y-2">
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Correo electrónico
                </h2>
                <a
                  href="mailto:info@dermatologika.net"
                  className="inline-flex items-start gap-2 rounded-md border border-border bg-surface-canvas p-3 text-body-sm text-text-primary transition hover:border-border-brand"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                  <span>info@dermatologika.net</span>
                </a>
              </article>

              <article className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                    Horario
                  </h2>
                  <span className="inline-flex items-center gap-1 text-label-sm text-status-success">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    Abierto ahora
                  </span>
                </div>
                <ul className="space-y-1 rounded-md border border-border bg-surface-canvas p-3">
                  {businessHours.map((item) => (
                    <li key={item.day} className="flex items-center justify-between gap-4 text-body-sm">
                      <span className="text-text-secondary">{item.day}</span>
                      <span className="font-medium text-text-primary">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="space-y-2">
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Redes sociales
                </h2>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook Dermatologika"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-canvas text-brand-primary transition hover:border-border-brand hover:bg-surface-brandTint"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram Dermatologika"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-canvas text-brand-primary transition hover:border-border-brand hover:bg-surface-brandTint"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-full">
            <iframe
              title="Ubicación Dermatologika en Loja"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
