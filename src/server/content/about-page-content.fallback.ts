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
    pretitle: "Cultivando bienestar",
    title: "Ciencia, naturaleza y tecnología desde el origen",
    subtitle:
      "Un gran producto comienza mucho antes de llegar a su presentación final. Comienza en el origen: una colmena, una fruta recién cosechada, una semilla, una planta aromática, los cristales obtenidos del mar o un grano de cacao cultivado en las tierras de Palanda.",
    ctaText: "Conoce nuestros productos",
    ctaHref: "/productos",
    media: buildLocalMediaAsset("364942.jpg", "Ciencia, naturaleza y tecnología desde el origen"),
  },
  history: {
    pretitle: "Nuestra filosofía",
    title: "Del origen al proceso. Del proceso al producto.",
    subtitle:
      "Comprender cada materia prima para definir el proceso que la transforma en un producto cuidadosamente elaborado.",
    ctaText: "Descubre nuestra historia",
    ctaHref: "#historia",
    seoText:
      "En Eterna Vida creemos que un gran producto comienza en el origen. Nuestra filosofía consiste en comprender cada materia prima y aplicar el proceso adecuado para transformarla, combinando conocimiento técnico, tecnología de procesamiento y respeto por sus características naturales.\n\nProcesos como la centrifugación, la deshidratación, la fermentación controlada, el prensado en frío, la destilación por arrastre de vapor, la molienda, la filtración, el refinado y el encapsulado forman parte de nuestra manera de transformar materias primas en productos terminados. Colmenas, frutas, semillas, plantas, mar y cacao: diferentes materias primas, diferentes procesos, una misma filosofía.",
    media: buildLocalMediaAsset("23273.jpg", "Del origen al proceso, del proceso al producto"),
  },
  mission: {
    pretitle: "Naturaleza + Ciencia",
    title: "Naturaleza como origen. Ciencia como herramienta.",
    seoText:
      "Seleccionamos el origen. Estudiamos la materia prima. Definimos el proceso. Controlamos las variables. Transformamos. Y desarrollamos el producto.\n\nEn Eterna Vida no vemos una fruta simplemente como una fruta: vemos agua, fibra, azúcares naturales, estructura y composición. No vemos una semilla únicamente como una semilla: vemos una estructura vegetal que contiene una fracción oleosa que podemos extraer mediante presión mecánica. Y no vemos una planta aromática solamente por su aroma: estudiamos cómo sus componentes volátiles pueden ser separados mediante destilación y condensación.",
    media: buildLocalMediaAsset("484899.jpg", "Naturaleza como origen, ciencia como herramienta"),
  },
  vision: {
    pretitle: "Nuestro método",
    title: "Conocer lo que procesamos para entender lo que producimos",
    subtitle: "Seis pasos que aplicamos a cada materia prima que llega a nuestras manos.",
    seoText:
      "Cada etapa responde a las características particulares de la materia prima. Seleccionamos el origen, estudiamos su composición, definimos la operación adecuada, controlamos las variables de proceso, transformamos y desarrollamos el producto final.\n\nCuando observamos una colmena entendemos que detrás de ella existe uno de los sistemas naturales más extraordinarios que podemos encontrar. Ese mismo criterio aplicamos a las frutas, las semillas, las plantas aromáticas, la sal marina y el cacao de origen.",
    media: buildLocalMediaAsset("48159.jpg", "Conocer lo que procesamos para entender lo que producimos"),
  },
  differentiators: {
    pretitle: "Nuestras tecnologías",
    title: "Un proceso distinto para cada materia prima",
    subtitle:
      "No aplicamos un único método: cada línea de producto exige su propia tecnología de transformación.",
    ctaText: "Ver nuestros productos",
    ctaHref: "/productos",
    seoText:
      "Trabajamos seis líneas de producto y cada una responde a una tecnología diferente: productos de la colmena, snacks de frutas deshidratadas, harinas libres de gluten, aceites vegetales, aceites esenciales y cápsulas, sales marinas y cacao de origen Palanda. Detrás de cada presentación existe una cadena de operaciones definida y controlada.",
    items: [
      {
        id: "diff-1",
        text: "Centrifugación y filtración: separamos la miel del panal tras el desoperculado y la acondicionamos antes del envasado.",
        mediaId: null,
        media: buildLocalMediaAsset("138219.jpg", "Centrifugación y filtración de miel"),
      },
      {
        id: "diff-2",
        text: "Deshidratación controlada: reducimos el agua disponible en la fruta controlando temperatura, tiempo y condiciones de proceso.",
        mediaId: null,
        media: buildLocalMediaAsset("147186.jpg", "Deshidratación controlada de frutas"),
      },
      {
        id: "diff-3",
        text: "Fermentación controlada: microorganismos específicos transforman los azúcares de la miel y desarrollan los precursores del cacao.",
        mediaId: null,
        media: buildLocalMediaAsset("2247.jpg", "Fermentación controlada"),
      },
      {
        id: "diff-4",
        text: "Prensado en frío: extracción mecánica que libera el aceite minimizando la exposición innecesaria a altas temperaturas.",
        mediaId: null,
        media: buildLocalMediaAsset("87122.jpg", "Prensado en frío de aceites vegetales"),
      },
      {
        id: "diff-5",
        text: "Destilación por arrastre de vapor: el vapor transporta los componentes volátiles de la planta y, tras condensarlos, separamos el aceite esencial del hidrolato.",
        mediaId: null,
        media: buildLocalMediaAsset("364942.jpg", "Destilación por arrastre de vapor"),
      },
      {
        id: "diff-6",
        text: "Molienda, refinado y encapsulado: reducimos el tamaño de partícula hasta obtener texturas finas y uniformes, y dosificamos los aceites en cápsulas.",
        mediaId: null,
        media: buildLocalMediaAsset("23273.jpg", "Molienda, refinado y encapsulado"),
      },
    ],
  },
  production: {
    pretitle: "Del origen a tus manos",
    title: "Cada producto tiene su propia cadena de proceso",
    subtitle: "Estas son algunas de las rutas que recorren nuestras materias primas.",
    ctaText: "Conoce nuestro proceso",
    ctaHref: "#produccion",
    seoText:
      "Miel de abeja: Panales → Desoperculado → Centrifugación → Filtración → Envasado.\n\nSnacks de frutas: Selección → Lavado → Preparación → Corte → Deshidratación → Enfriamiento → Empacado.\n\nAceites vegetales: Materia prima → Preparación → Prensado → Decantación → Filtración → Envasado.\n\nAceites esenciales: Planta → Vapor → Extracción → Condensación → Separación → Aceite esencial.\n\nCacao de origen: Cosecha → Selección → Fermentación → Secado → Tostado → Descascarillado → Molienda → Prensado → Refinado → Tamizado.",
    media: buildLocalMediaAsset("181090.jpg", "Cadenas de proceso de Eterna Vida"),
  },
  impact: {
    pretitle: "Ecuador, cacao y origen",
    title: "Nuestro cacao nace en Palanda, Zamora Chinchipe",
    subtitle: "Una región ecuatoriana profundamente vinculada con la historia del cacao.",
    ctaText: "Sé parte del cambio",
    ctaHref: "/productos",
    seoText:
      "En Palanda, provincia de Zamora Chinchipe, comienza un proceso en el que agricultura, microbiología e ingeniería de alimentos se encuentran. Todo empieza con la cosecha y selección de las mazorcas; después de abrirlas extraemos los granos cubiertos por su pulpa natural y comienza la fermentación, una de las etapas más importantes.\n\nDe un mismo grano obtenemos productos completamente diferentes: pasta de cacao, nibs, manteca, cacao en polvo y cacao 100% refinado. Trabajar con cacao de origen significa sostener el vínculo con los agricultores de la zona y con la historia cacaotera del Ecuador.",
    media: buildLocalMediaAsset("1107.jpg", "Cacao de origen Palanda, Zamora Chinchipe"),
  },
  cta: {
    pretitle: "Ciencia. Naturaleza. Origen.",
    title: "Cultivando bienestar",
    subtitle:
      "Colmenas, frutas, semillas, plantas, mar y cacao. Diferentes materias primas, diferentes procesos, una misma filosofía. Descubre toda nuestra línea de productos.",
    ctaText: "Comprar ahora",
    ctaHref: "/productos",
  },
};
