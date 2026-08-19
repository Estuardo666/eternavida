import type { AboutPageContent } from "@/types/about-content";
import type { MediaAsset } from "@/types/media";

function buildLocalMediaAsset(fileName: string, altText: string): MediaAsset {
  return {
    id: `about-fallback-media-${fileName}`,
    kind: "image",
    url: `/media/new dev media/${encodeURIComponent(fileName)}`,
    storageKey: `public/media/new dev media/${fileName}`,
    altText,
    mimeType: null,
    posterUrl: null,
    width: null,
    height: null,
    durationSeconds: null,
  };
}

export const fallbackAboutPageContent: AboutPageContent = {
  hero: {
    pretitle: "Cultivando bienestar desde Ecuador",
    title: "Productos naturales elaborados con propósito",
    subtitle:
      "Creemos que una vida más saludable comienza con ingredientes naturales, procesos responsables y el compromiso de llevar bienestar a cada familia.",
    ctaText: "Conoce nuestros productos",
    ctaHref: "/productos",
    media: buildLocalMediaAsset("364942.jpg", "Productos naturales elaborados con propósito"),
  },
  history: {
    pretitle: "Nuestra historia",
    title: "El origen de Eterna Vida",
    subtitle:
      "Una marca nacida de la convicción de que la naturaleza puede convertirse en una aliada para el bienestar diario.",
    ctaText: "Descubre nuestra historia",
    ctaHref: "#historia",
    seoText:
      "Eterna Vida nació en Ecuador con una misión clara: acercar productos naturales y orgánicos a las personas que buscan mejorar su calidad de vida. Inspirados por el poder de los ingredientes naturales y las tradiciones ancestrales, desarrollamos productos elaborados con dedicación, responsabilidad y respeto por la naturaleza.\n\nDesde nuestros inicios hemos trabajado para ofrecer alternativas naturales que formen parte de un estilo de vida consciente, saludable y sostenible. Cada producto refleja nuestro compromiso con la calidad, la transparencia y el bienestar de nuestros clientes.",
    media: buildLocalMediaAsset("23273.jpg", "El origen de Eterna Vida"),
  },
  mission: {
    pretitle: "Misión",
    title: "Ayudar a las personas a vivir mejor",
    seoText:
      "Nuestra misión es promover hábitos saludables mediante productos naturales elaborados con ingredientes cuidadosamente seleccionados. Buscamos contribuir al bienestar de las familias ecuatorianas ofreciendo alternativas responsables.",
    media: buildLocalMediaAsset("484899.jpg", "Ayudar a las personas a vivir mejor"),
  },
  vision: {
    pretitle: "Nuestra visión",
    title: "Queremos llegar a más hogares",
    subtitle: "Llevando productos naturales de calidad a cada familia.",
    seoText:
      "Nuestra visión es convertirnos en una marca referente de productos naturales y bienestar en Ecuador y otros mercados, destacándonos por nuestra calidad, innovación y compromiso con la sostenibilidad.",
    media: buildLocalMediaAsset("48159.jpg", "Queremos llegar a más hogares"),
  },
  differentiators: {
    pretitle: "Compromiso Eterna Vida",
    title: "La diferencia está en cada detalle",
    subtitle: "Ingredientes naturales, procesos responsables y una visión centrada en el bienestar.",
    ctaText: "Ver nuestros productos",
    ctaHref: "/productos",
    seoText:
      "En Eterna Vida creemos que la calidad comienza desde el origen. Por eso seleccionamos cuidadosamente nuestras materias primas y mantenemos procesos que priorizan la pureza, la trazabilidad y la responsabilidad ambiental.",
    items: [
      { id: "diff-1", text: "Ingredientes de origen natural.", mediaId: null, media: buildLocalMediaAsset("138219.jpg", "Ingredientes de origen natural") },
      { id: "diff-2", text: "Procesos artesanales y responsables.", mediaId: null, media: buildLocalMediaAsset("147186.jpg", "Procesos artesanales y responsables") },
      { id: "diff-3", text: "Compromiso con la sostenibilidad.", mediaId: null, media: buildLocalMediaAsset("2247.jpg", "Compromiso con la sostenibilidad") },
      { id: "diff-4", text: "Producción ecuatoriana.", mediaId: null, media: buildLocalMediaAsset("87122.jpg", "Producción ecuatoriana") },
      { id: "diff-5", text: "Enfoque en bienestar integral.", mediaId: null, media: buildLocalMediaAsset("364942.jpg", "Enfoque en bienestar integral") },
      { id: "diff-6", text: "Calidad y transparencia en cada etapa.", mediaId: null, media: buildLocalMediaAsset("23273.jpg", "Calidad y transparencia en cada etapa") },
    ],
  },
  production: {
    pretitle: "Del origen a tus manos",
    title: "Cuidamos cada etapa del proceso",
    subtitle: "La calidad no es casualidad; es el resultado de un trabajo responsable y constante.",
    ctaText: "Conoce nuestro proceso",
    ctaHref: "#produccion",
    seoText:
      "Cada producto Eterna Vida es elaborado siguiendo procesos que buscan preservar las propiedades naturales de sus ingredientes. Desde la selección de materias primas hasta el empaque final, mantenemos estándares orientados a garantizar calidad, frescura y confianza.",
    media: buildLocalMediaAsset("181090.jpg", "Cuidamos cada etapa del proceso"),
  },
  impact: {
    pretitle: "Más que una marca",
    title: "Generando bienestar para nuestra comunidad",
    subtitle: "Cada compra contribuye al crecimiento de personas, familias y comunidades.",
    ctaText: "Sé parte del cambio",
    ctaHref: "/productos",
    seoText:
      "Creemos que una empresa debe generar valor más allá de sus productos. Por eso impulsamos iniciativas que promueven oportunidades de trabajo, desarrollo local y crecimiento económico en las comunidades con las que colaboramos.",
    media: buildLocalMediaAsset("1107.jpg", "Generando bienestar para nuestra comunidad"),
  },
  cta: {
    pretitle: "Bienestar para cada día",
    title: "Descubre el poder de lo natural",
    subtitle:
      "Explora nuestra selección de productos elaborados para acompañarte en un estilo de vida saludable.",
    ctaText: "Comprar ahora",
    ctaHref: "/productos",
  },
};
