/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Catálogo real Eternavida — 8 categorías, 28 productos.
 * Fuente: "Nueva info.md" (descripciones y procesos) + "productos y precios.md" (presentaciones y precios).
 */

const BRAND = "Eternavida";
const CTA = "#contact-cta";

const categories = [
  {
    slug: "productos-de-la-colmena",
    name: "Productos de la colmena",
    description:
      "Miel, polen, propóleo y vino de miel obtenidos mediante centrifugación, maceración y fermentación controlada.",
  },
  {
    slug: "snacks-saludables",
    name: "Snacks saludables",
    description:
      "Frutas deshidratadas y mix de frutos secos. Retiramos el agua para concentrar la esencia de cada fruta.",
  },
  {
    slug: "harinas-y-polvos-sin-gluten",
    name: "Harinas y polvos libres de gluten",
    description:
      "Materias primas agrícolas convertidas en polvos estables, homogéneos y versátiles mediante deshidratación y molienda.",
  },
  {
    slug: "aceites-vegetales",
    name: "Aceites vegetales",
    description:
      "Aceites extraídos por prensado en frío, decantados y filtrados para conservar sus características naturales.",
  },
  {
    slug: "aceites-esenciales",
    name: "Aceites esenciales y medicinales",
    description:
      "Destilación por arrastre de vapor aplicada a plantas aromáticas para separar y concentrar su fracción volátil.",
  },
  {
    slug: "capsulas-de-aceites",
    name: "Cápsulas de aceites esenciales y vegetales",
    description:
      "De la extracción a una dosis precisa: aceites formulados, dosificados y encapsulados con uniformidad entre unidades.",
  },
  {
    slug: "sales-marinas",
    name: "Sales marinas",
    description:
      "Cristales de origen marino recolectados, limpiados y clasificados por granulometría.",
  },
  {
    slug: "cacao-de-palanda",
    name: "Cacao de origen Palanda",
    description:
      "Cacao de Palanda, Zamora Chinchipe. Fermentación, secado, tostado, molienda, prensado y refinado.",
  },
];

const trustBadgesDefault = [
  { text: "Envío a todo el país", iconKey: "shield", sortOrder: 0 },
  { text: "Producto elaborado en Ecuador", iconKey: "leaf", sortOrder: 1 },
  { text: "Trazabilidad desde el origen", iconKey: "check-circle", sortOrder: 2 },
];

const certByCategory = {
  "productos-de-la-colmena": [
    { label: "Colmenas propias", iconKey: "leaf", sortOrder: 0 },
    { label: "Sin aditivos", iconKey: "shield", sortOrder: 1 },
    { label: "Proceso controlado", iconKey: "flask", sortOrder: 2 },
  ],
  "snacks-saludables": [
    { label: "Sin azúcar añadida", iconKey: "shield", sortOrder: 0 },
    { label: "100% fruta", iconKey: "leaf", sortOrder: 1 },
    { label: "Deshidratado controlado", iconKey: "flask", sortOrder: 2 },
  ],
  "harinas-y-polvos-sin-gluten": [
    { label: "Libre de gluten", iconKey: "shield", sortOrder: 0 },
    { label: "Molienda fina", iconKey: "flask", sortOrder: 1 },
    { label: "Origen agrícola", iconKey: "leaf", sortOrder: 2 },
  ],
  "aceites-vegetales": [
    { label: "Prensado en frío", iconKey: "flask", sortOrder: 0 },
    { label: "Sin refinar", iconKey: "leaf", sortOrder: 1 },
    { label: "Filtrado", iconKey: "shield", sortOrder: 2 },
  ],
  "aceites-esenciales": [
    { label: "Arrastre de vapor", iconKey: "flask", sortOrder: 0 },
    { label: "Concentrado", iconKey: "sparkle", sortOrder: 1 },
    { label: "100% puro", iconKey: "shield", sortOrder: 2 },
  ],
  "capsulas-de-aceites": [
    { label: "Dosis uniforme", iconKey: "flask", sortOrder: 0 },
    { label: "90 cápsulas", iconKey: "check-circle", sortOrder: 1 },
    { label: "Sin conservantes", iconKey: "shield", sortOrder: 2 },
  ],
  "sales-marinas": [
    { label: "Origen marino", iconKey: "droplet", sortOrder: 0 },
    { label: "Clasificada", iconKey: "flask", sortOrder: 1 },
    { label: "Sin antiaglomerantes", iconKey: "shield", sortOrder: 2 },
  ],
  "cacao-de-palanda": [
    { label: "Origen Palanda", iconKey: "leaf", sortOrder: 0 },
    { label: "Fermentación controlada", iconKey: "flask", sortOrder: 1 },
    { label: "100% cacao", iconKey: "award", sortOrder: 2 },
  ],
};

/** Helper: build variants from [name, price] pairs. */
const v = (pairs) =>
  pairs.map(([name, price], i) => ({ name, price, discountPrice: null, stock: 40, sortOrder: i }));

/** Helper: ingredients from [name, description] pairs. */
const ing = (pairs) =>
  pairs.map(([name, description], i) => ({ name, description, sortOrder: i }));

/** Helper: benefits from [text, iconKey] pairs. */
const ben = (pairs) => pairs.map(([text, iconKey], i) => ({ text, iconKey, sortOrder: i }));

/** Helper: usage steps from strings. */
const use = (steps) => steps.map((text, i) => ({ stepNumber: i + 1, text }));

/** Helper: reviews from [rating, title, body, author] tuples. */
const rev = (rows) =>
  rows.map(([rating, title, body], i) => ({
    rating,
    title,
    body,
    clerkUserId: `seed-review-${i + 1}`,
  }));

const products = [
  // ── PRODUCTOS DE LA COLMENA ───────────────────────────────────────────────
  {
    slug: "miel-de-abeja",
    name: "Miel de abeja",
    category: "productos-de-la-colmena",
    preTitle: "Directamente de la colmena",
    slogan: "Panales maduros, centrifugación y nada más.",
    productColor: "#D89B2A",
    badge: "Destacado",
    badgeColor: "#B7791F",
    shortDescription:
      "Miel extraída por centrifugación de panales maduros, filtrada y envasada conservando su origen floral.",
    description:
      "Seleccionamos panales maduros para iniciar nuestro proceso de extracción. Después del desoperculado, los cuadros ingresan al extractor, donde mediante fuerza centrífuga separamos la miel del panal.",
    longDescription:
      "Seleccionamos panales maduros para iniciar el proceso de extracción. Tras el desoperculado, los cuadros ingresan al extractor y la fuerza centrífuga separa la miel del panal. Posteriormente la miel pasa por filtración y acondicionamiento antes de ser envasada. El resultado conserva el aroma, color, textura y sabor característicos de su origen floral.\n\nProceso: Panales → Desoperculado → Centrifugación → Filtración → Envasado.",
    variants: v([["250 g", 6.0], ["600 g", 11.0]]),
    ingredients: ing([
      ["Miel de abeja", "Único ingrediente. Extraída por centrifugación, sin dilución ni añadidos."],
      ["Enzimas naturales", "Presentes de forma natural en la miel cruda tras una filtración suave."],
      ["Polen residual", "Micropartículas de polen propias del origen floral del panal."],
    ]),
    benefits: ben([
      ["Extracción por centrifugación", "flask"],
      ["Conserva aroma y color de origen floral", "sparkle"],
      ["Sin azúcares añadidos", "shield"],
      ["Endulzante natural", "heart"],
      ["Colmenas seleccionadas", "leaf"],
    ]),
    usageSteps: use([
      "Endulza bebidas frías o calientes con 1 a 2 cucharadas al gusto.",
      "Unta sobre pan, tostadas o frutas como alternativa al azúcar refinada.",
      "Disuelve una cucharada en agua tibia con limón para aliviar la garganta.",
      "Conserva en lugar fresco y seco. La cristalización es natural: entibia el frasco a baño maría para revertirla.",
    ]),
    reviews: rev([
      [5, "Sabor real a miel", "Se nota que no está diluida. El aroma floral es intenso y cristalizó como debe ser."],
      [5, "Excelente presentación", "El frasco de 600 g rinde muchísimo. Repetiré la compra."],
      [4, "Muy buena", "Densa y aromática. Solo desearía una presentación más grande."],
    ]),
  },
  {
    slug: "polen-de-abeja",
    name: "Polen de abeja",
    category: "productos-de-la-colmena",
    preTitle: "Gránulos de miles de flores",
    slogan: "Cada color, un origen botánico distinto.",
    productColor: "#E2A93B",
    badge: "Natural",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Gránulos de polen recolectados, seleccionados y limpiados. Su diversidad de colores refleja su origen botánico.",
    description:
      "Las abejas recolectan partículas de polen durante sus recorridos y las transportan hasta la colmena. Mediante sistemas especializados recolectamos cuidadosamente una parte de este material.",
    longDescription:
      "Las abejas recolectan partículas de polen durante sus recorridos y las transportan hasta la colmena. Mediante sistemas especializados recolectamos cuidadosamente una parte de este material.\n\nPosteriormente realizamos etapas de selección, limpieza y acondicionamiento, obteniendo un producto cuya diversidad de colores refleja los diferentes orígenes botánicos visitados por las abejas.\n\nProceso: Recolección → Selección → Limpieza → Acondicionamiento → Envasado.",
    variants: v([["180 g", 8.0], ["350 g", 13.0]]),
    ingredients: ing([
      ["Polen de abeja", "Gránulos recolectados en colmena, seleccionados y limpiados."],
      ["Aminoácidos", "Componentes proteicos presentes de forma natural en el grano de polen."],
      ["Vitaminas y minerales", "Micronutrientes propios de la diversidad floral recolectada."],
    ]),
    benefits: ben([
      ["Diversidad botánica en cada frasco", "leaf"],
      ["Selección y limpieza controladas", "flask"],
      ["Fuente natural de micronutrientes", "heart"],
      ["Sin aditivos ni conservantes", "shield"],
      ["Presentación práctica", "check-circle"],
    ]),
    usageSteps: use([
      "Consume 1 cucharadita al día, preferiblemente en la mañana.",
      "Añádelo a yogur, batidos, avena o ensaladas de fruta.",
      "Si es tu primera vez, comienza con media cucharadita y aumenta progresivamente.",
      "Guarda el frasco cerrado en un lugar fresco y seco.",
    ]),
    reviews: rev([
      [5, "Gránulos muy limpios", "Sin residuos ni impurezas. Se nota la selección."],
      [5, "Ideal en el desayuno", "Lo mezclo con yogur todos los días. Textura y sabor muy buenos."],
      [4, "Buen producto", "La presentación de 350 g conviene más por precio."],
    ]),
  },
  {
    slug: "propoleo",
    name: "Propóleo",
    category: "productos-de-la-colmena",
    preTitle: "La resina protectora de la colmena",
    slogan: "Maceración controlada, filtración y concentración.",
    productColor: "#8B5E2B",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Extracto de propóleo obtenido por maceración controlada y filtración a partir de resinas recolectadas por las abejas.",
    description:
      "Las abejas elaboran propóleo a partir de sustancias resinosas recolectadas de diferentes fuentes vegetales. Tras su recolección, seleccionamos la materia prima y la sometemos a maceración controlada.",
    longDescription:
      "Las abejas elaboran propóleo a partir de sustancias resinosas recolectadas de diferentes fuentes vegetales. Después de su recolección, seleccionamos la materia prima y la sometemos a un proceso de maceración controlada.\n\nDurante esta etapa se favorece la extracción de determinados componentes presentes naturalmente en el propóleo. Posteriormente realizamos procesos de filtración y acondicionamiento para obtener el producto final.\n\nProceso: Recolección → Selección → Maceración → Filtración → Acondicionamiento.",
    variants: v([["30 ml", 6.0]]),
    ingredients: ing([
      ["Propóleo de abeja", "Resina recolectada en colmena, seleccionada antes de la maceración."],
      ["Flavonoides", "Compuestos fenólicos presentes naturalmente en la resina."],
      ["Extracto acondicionado", "Fracción soluble obtenida durante la maceración controlada."],
    ]),
    benefits: ben([
      ["Maceración controlada", "flask"],
      ["Extracto concentrado", "sparkle"],
      ["Filtrado y acondicionado", "shield"],
      ["Presentación en gotero práctico", "check-circle"],
      ["Materia prima de colmena seleccionada", "leaf"],
    ]),
    usageSteps: use([
      "Aplica de 5 a 10 gotas bajo la lengua o diluidas en agua.",
      "También puede aplicarse directamente sobre la zona de la garganta.",
      "Uso sugerido de 1 a 3 veces al día.",
      "Agita antes de usar y mantén el frasco protegido de la luz.",
    ]),
    reviews: rev([
      [5, "Concentrado de verdad", "Se siente potente desde la primera gota."],
      [4, "Buen formato", "El gotero de 30 ml es cómodo de dosificar."],
      [5, "Lo tengo siempre en casa", "Producto que repito sin dudar."],
    ]),
  },
  {
    slug: "vino-de-miel-de-abeja",
    name: "Vino de miel de abeja",
    category: "productos-de-la-colmena",
    preTitle: "Miel transformada por fermentación",
    slogan: "Microbiología y tiempo aplicados a la miel.",
    productColor: "#A9762F",
    badge: "Edición especial",
    badgeColor: "#8A5CF6",
    shortDescription:
      "Miel fermentada de forma controlada, con etapas de reposo, clarificación y filtración antes del envasado.",
    description:
      "Tomamos uno de los productos más representativos de la colmena y lo transformamos mediante microbiología y tiempo, en un proceso de fermentación controlada.",
    longDescription:
      "La miel es incorporada a una formulación cuidadosamente definida antes de iniciar un proceso de fermentación controlada. Durante esta etapa, microorganismos específicos transforman progresivamente los azúcares fermentables presentes en la formulación.\n\nDespués de la fermentación se realizan etapas de reposo, clarificación, filtración y acondicionamiento.\n\nProceso: Miel → Formulación → Fermentación → Reposo → Clarificación → Filtración → Envasado.",
    variants: v([["750 ml", 18.0]]),
    ingredients: ing([
      ["Miel de abeja", "Base fermentable del producto, proveniente de nuestra propia extracción."],
      ["Levaduras seleccionadas", "Microorganismos específicos que conducen la fermentación controlada."],
      ["Agua", "Componente de la formulación previa a la fermentación."],
    ]),
    benefits: ben([
      ["Fermentación controlada", "flask"],
      ["Reposo y clarificación", "sparkle"],
      ["Elaboración artesanal", "award"],
      ["Botella de 750 ml", "check-circle"],
      ["Elaborado con miel propia", "leaf"],
    ]),
    usageSteps: use([
      "Sirve frío, entre 8 °C y 12 °C.",
      "Marida con quesos suaves, frutas frescas o postres ligeros.",
      "Una vez abierta, conserva la botella refrigerada y consúmela en pocos días.",
      "Consumir con moderación. Venta prohibida a menores de 18 años.",
    ]),
    reviews: rev([
      [5, "Sorprendente", "No esperaba este nivel de equilibrio. Muy buen producto para regalar."],
      [5, "Distinto a todo", "Aroma a miel muy presente sin resultar empalagoso."],
      [4, "Buena botella", "Ideal para ocasiones especiales."],
    ]),
  },

  // ── SNACKS SALUDABLES ─────────────────────────────────────────────────────
  {
    slug: "mango-deshidratado",
    name: "Manguitos — Mango deshidratado",
    category: "snacks-saludables",
    preTitle: "Snack de fruta",
    slogan: "Cuando retiramos el agua, concentramos la esencia.",
    productColor: "#F2A73B",
    badge: "Nuevo",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Mango seleccionado y deshidratado para concentrar su característico sabor tropical.",
    description:
      "Mango seleccionado y cuidadosamente deshidratado para concentrar su característico sabor tropical. Una combinación de aroma, textura y dulzor propio de la fruta en una presentación práctica.",
    longDescription:
      "Seleccionamos frutas considerando madurez, apariencia y condiciones adecuadas para procesamiento. Las frutas son lavadas, preparadas y cortadas antes de ingresar al proceso de deshidratación, donde controlamos temperatura, tiempo y condiciones para retirar progresivamente gran parte del agua presente.\n\nProceso: Selección → Lavado → Preparación → Corte → Deshidratación → Enfriamiento → Empacado.",
    variants: v([["40 g", 1.5]]),
    ingredients: ing([
      ["Mango deshidratado", "100% mango. Sin azúcar añadida ni conservantes."],
      ["Fibra natural", "Fracción fibrosa propia de la fruta, concentrada al retirar el agua."],
      ["Azúcares propios de la fruta", "Dulzor natural del mango, concentrado por deshidratación."],
    ]),
    benefits: ben([
      ["100% fruta, sin azúcar añadida", "leaf"],
      ["Deshidratación con variables controladas", "flask"],
      ["Formato portátil de 40 g", "check-circle"],
      ["Sabor tropical concentrado", "sparkle"],
      ["Snack sin fritura", "heart"],
    ]),
    usageSteps: use([
      "Consúmelo directamente como snack entre comidas.",
      "Añádelo a granolas, yogur, avena o ensaladas.",
      "Pícalo en trozos para repostería y panadería.",
      "Cierra bien el empaque tras abrirlo para conservar la textura.",
    ]),
    reviews: rev([
      [5, "Adictivo", "Sabor intenso y nada empalagoso. Se acaba rápido."],
      [5, "Perfecto para la oficina", "Formato ideal para llevar en el bolso."],
      [4, "Muy rico", "Ojalá hubiera una presentación más grande."],
    ]),
  },
  {
    slug: "fresa-deshidratada",
    name: "Fresitas — Fresa deshidratada",
    category: "snacks-saludables",
    preTitle: "Snack de fruta",
    slogan: "Ligera, aromática y de sabor concentrado.",
    productColor: "#D64B5A",
    badge: "Nuevo",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Fresas seleccionadas y sometidas a deshidratación controlada hasta obtener una fruta ligera y aromática.",
    description:
      "Fresas seleccionadas y sometidas a deshidratación controlada. Al reducir progresivamente su contenido de agua conseguimos una fruta ligera, aromática y con un sabor concentrado característico de la fresa.",
    longDescription:
      "Las fresas son seleccionadas, lavadas, preparadas y cortadas antes de ingresar al proceso de deshidratación. Controlamos temperatura, tiempo y condiciones de proceso para retirar progresivamente gran parte del agua presente en la fruta.\n\nProceso: Selección → Lavado → Preparación → Corte → Deshidratación → Enfriamiento → Empacado.",
    variants: v([["40 g", 1.5]]),
    ingredients: ing([
      ["Fresa deshidratada", "100% fresa. Sin azúcar añadida ni colorantes."],
      ["Antioxidantes naturales", "Compuestos propios de la fresa que aportan su color característico."],
      ["Fibra natural", "Fracción fibrosa concentrada tras la deshidratación."],
    ]),
    benefits: ben([
      ["100% fruta, sin colorantes", "leaf"],
      ["Textura ligera y crujiente", "sparkle"],
      ["Deshidratación controlada", "flask"],
      ["Formato de 40 g", "check-circle"],
      ["Snack sin azúcar añadida", "shield"],
    ]),
    usageSteps: use([
      "Consúmelo directamente como snack.",
      "Combínalo con cereales, yogur o chocolate.",
      "Úsalo como decoración natural en postres y batidos.",
      "Conserva el empaque cerrado en lugar fresco y seco.",
    ]),
    reviews: rev([
      [5, "Sabor puro a fresa", "Sin acidez extraña ni azúcar de más."],
      [4, "Muy crujiente", "Buenísimo con yogur griego."],
      [5, "Los niños lo aman", "Alternativa real a las golosinas."],
    ]),
  },
  {
    slug: "pina-deshidratada",
    name: "Piñitas — Piña deshidratada",
    category: "snacks-saludables",
    preTitle: "Snack de fruta",
    slogan: "Equilibrio entre dulzor y acidez.",
    productColor: "#E8C33C",
    badge: "Nuevo",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Piñas seleccionadas y deshidratadas hasta obtener piezas con un equilibrio característico entre dulzor y acidez.",
    description:
      "Seleccionamos piñas y las transformamos mediante deshidratación para obtener piezas con un equilibrio característico entre dulzor y acidez.",
    longDescription:
      "Seleccionamos piñas considerando madurez y condiciones adecuadas para procesamiento. Tras el lavado, la preparación y el corte, la fruta ingresa al proceso de deshidratación con variables controladas de temperatura y tiempo.\n\nProceso: Selección → Lavado → Preparación → Corte → Deshidratación → Enfriamiento → Empacado.",
    variants: v([["40 g", 1.5]]),
    ingredients: ing([
      ["Piña deshidratada", "100% piña. Sin azúcar añadida ni conservantes."],
      ["Ácidos orgánicos naturales", "Responsables del carácter ácido propio de la piña."],
      ["Fibra natural", "Fracción fibrosa concentrada tras retirar el agua."],
    ]),
    benefits: ben([
      ["Dulzor y acidez equilibrados", "sparkle"],
      ["100% fruta", "leaf"],
      ["Sin conservantes", "shield"],
      ["Formato de 40 g", "check-circle"],
      ["Deshidratación controlada", "flask"],
    ]),
    usageSteps: use([
      "Consúmelo directamente como snack.",
      "Añádelo a mezclas de frutos secos o granolas.",
      "Hidrátalo unos minutos en agua tibia para usarlo en repostería.",
      "Mantén el empaque cerrado tras abrirlo.",
    ]),
    reviews: rev([
      [5, "Muy fresca", "El punto ácido la hace diferente al resto."],
      [4, "Buena textura", "Ni dura ni chiclosa."],
      [5, "Repito", "Mi favorita del mix."],
    ]),
  },
  {
    slug: "coco-deshidratado",
    name: "Coquitos — Coco deshidratado",
    category: "snacks-saludables",
    preTitle: "Snack de fruta",
    slogan: "Aroma, textura y sabor característicos del coco.",
    productColor: "#C9B79C",
    badge: "Nuevo",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Pulpa de coco seleccionada, preparada y deshidratada cuidadosamente.",
    description:
      "Pulpa de coco seleccionada, preparada y deshidratada cuidadosamente. El resultado es un snack con el aroma, textura y sabor característicos del coco.",
    longDescription:
      "La pulpa de coco es seleccionada, lavada, preparada y cortada antes de ingresar al proceso de deshidratación, donde controlamos temperatura, tiempo y condiciones de proceso.\n\nProceso: Selección → Lavado → Preparación → Corte → Deshidratación → Enfriamiento → Empacado.",
    variants: v([["40 g", 1.5]]),
    ingredients: ing([
      ["Coco deshidratado", "100% pulpa de coco. Sin azúcar añadida."],
      ["Grasas naturales del coco", "Fracción oleosa propia de la pulpa, incluidos triglicéridos de cadena media."],
      ["Fibra natural", "Fracción fibrosa característica del coco."],
    ]),
    benefits: ben([
      ["100% pulpa de coco", "leaf"],
      ["Sin azúcar añadida", "shield"],
      ["Aporta grasas naturales del coco", "heart"],
      ["Formato de 40 g", "check-circle"],
      ["Deshidratación controlada", "flask"],
    ]),
    usageSteps: use([
      "Consúmelo directamente como snack.",
      "Espolvoréalo sobre postres, batidos o helados.",
      "Incorpóralo en repostería y panadería.",
      "Conserva en lugar fresco y seco tras abrir.",
    ]),
    reviews: rev([
      [5, "Sabor limpio", "Se nota que es coco de verdad, no aromatizado."],
      [4, "Muy versátil", "Lo uso en el café y en postres."],
      [5, "Excelente", "Textura perfecta."],
    ]),
  },
  {
    slug: "mix-de-frutas-deshidratadas",
    name: "Frutitas — Mix de frutas deshidratadas",
    category: "snacks-saludables",
    preTitle: "Snack de fruta",
    slogan: "Diferentes frutas. Diferentes colores. Diferentes texturas.",
    productColor: "#E07A4F",
    badge: "Destacado",
    badgeColor: "#B7791F",
    shortDescription:
      "Una selección de nuestras frutas deshidratadas combinadas en una sola presentación.",
    description:
      "Diferentes frutas. Diferentes colores. Diferentes texturas. Una selección de nuestras frutas deshidratadas combinadas en una sola presentación para disfrutar variedad en cada porción.",
    longDescription:
      "Cada fruta del mix se procesa por separado siguiendo su propio perfil de deshidratación, y luego se combinan en una única presentación. Así cada componente conserva la textura y el sabor que le corresponden.\n\nProceso: Selección → Lavado → Preparación → Corte → Deshidratación → Enfriamiento → Mezclado → Empacado.",
    variants: v([["45 g", 1.5]]),
    ingredients: ing([
      ["Mango deshidratado", "Aporta dulzor tropical al mix."],
      ["Piña deshidratada", "Aporta el contrapunto ácido."],
      ["Fresa deshidratada", "Aporta color y aroma."],
      ["Coco deshidratado", "Aporta textura y grasas naturales."],
    ]),
    benefits: ben([
      ["Cuatro frutas en una presentación", "sparkle"],
      ["100% fruta, sin azúcar añadida", "leaf"],
      ["Variedad de texturas", "check-circle"],
      ["Formato de 45 g", "shield"],
      ["Cada fruta con su propio proceso", "flask"],
    ]),
    usageSteps: use([
      "Consúmelo directamente como snack entre comidas.",
      "Mézclalo con frutos secos para una colación completa.",
      "Añádelo a yogur, avena o granolas caseras.",
      "Cierra bien el empaque para conservar la textura.",
    ]),
    reviews: rev([
      [5, "La mejor opción", "Variedad en cada puñado. Ideal para llevar."],
      [5, "Muy completo", "Mezcla bien lograda entre dulce y ácido."],
      [4, "Rico", "Me gustaría más proporción de fresa."],
    ]),
  },
  {
    slug: "mix-de-frutos-secos",
    name: "Mix de frutos secos",
    category: "snacks-saludables",
    preTitle: "Snack para el día",
    slogan: "Diferentes texturas, sabores y características naturales.",
    productColor: "#8C6239",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Combinación seleccionada de frutos secos, práctica para acompañarte durante el día.",
    description:
      "Una combinación seleccionada de frutos secos que reúne diferentes texturas, sabores y características naturales. Un snack práctico diseñado para acompañarte durante el día.",
    longDescription:
      "Seleccionamos los frutos secos por calibre, apariencia y condición, y los combinamos en proporciones definidas para lograr equilibrio entre texturas y sabores.\n\nProceso: Selección → Clasificación → Acondicionamiento → Mezclado → Empacado.",
    variants: v([["80 g", 1.5]]),
    ingredients: ing([
      ["Frutos secos seleccionados", "Mezcla de frutos secos clasificados por calibre y condición."],
      ["Grasas insaturadas naturales", "Fracción lipídica característica de los frutos secos."],
      ["Proteína vegetal", "Aporte proteico propio de la materia prima."],
    ]),
    benefits: ben([
      ["Formato generoso de 80 g", "check-circle"],
      ["Fuente natural de grasas saludables", "heart"],
      ["Sin fritura", "shield"],
      ["Snack práctico para el día", "sparkle"],
      ["Materia prima seleccionada", "leaf"],
    ]),
    usageSteps: use([
      "Consume un puñado como colación de media mañana o media tarde.",
      "Combínalo con nuestro mix de frutas deshidratadas.",
      "Añádelo a ensaladas para aportar textura.",
      "Conserva el empaque cerrado en lugar fresco y seco.",
    ]),
    reviews: rev([
      [5, "Muy buena relación cantidad-precio", "80 g rinde bastante para el precio."],
      [4, "Buena mezcla", "Frutos secos frescos, no rancios."],
      [5, "Mi snack diario", "Lo llevo siempre al trabajo."],
    ]),
  },

  // ── HARINAS Y POLVOS SIN GLUTEN ───────────────────────────────────────────
  {
    slug: "harina-de-camote",
    name: "Harina de camote",
    category: "harinas-y-polvos-sin-gluten",
    preTitle: "Ingrediente funcional",
    slogan: "Transformamos alimentos en ingredientes funcionales.",
    productColor: "#C77B4E",
    badge: "Sin gluten",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Camote precocido, deshidratado, molido y tamizado hasta obtener una harina fina y homogénea.",
    description:
      "Seleccionamos camotes que posteriormente son lavados, preparados y sometidos a un proceso de precocción controlada, deshidratación, molienda y tamizado.",
    longDescription:
      "Seleccionamos camotes que son lavados, preparados y sometidos a precocción controlada. Después se reduce progresivamente su humedad mediante deshidratación. Cuando el producto alcanza las condiciones requeridas, pasa por molienda y tamizado hasta obtener una harina fina y homogénea.\n\nUna nueva forma de aprovechar las características del camote y convertirlo en un ingrediente versátil para diferentes preparaciones.\n\nProceso: Selección → Lavado → Corte → Precocción → Deshidratación → Molienda → Tamizado → Empacado.",
    variants: v([["250 g", 7.0]]),
    ingredients: ing([
      ["Camote", "100% camote seleccionado, precocido y deshidratado."],
      ["Almidón natural", "Fracción de almidón propia del tubérculo, responsable de su poder espesante."],
      ["Fibra dietética", "Fracción fibrosa concentrada tras la deshidratación."],
    ]),
    benefits: ben([
      ["Libre de gluten", "shield"],
      ["Molienda fina y homogénea", "flask"],
      ["Ingrediente versátil", "sparkle"],
      ["100% camote", "leaf"],
      ["Precocción controlada", "check-circle"],
    ]),
    usageSteps: use([
      "Sustituye entre el 20 % y el 30 % de la harina de tu receta habitual.",
      "Úsala como espesante para sopas, cremas y salsas.",
      "Combínala con otras harinas sin gluten para panadería y repostería.",
      "Conserva en recipiente hermético, en lugar fresco y seco.",
    ]),
    reviews: rev([
      [5, "Muy fina", "No queda arenosa, se integra perfecto en las mezclas."],
      [4, "Buen producto", "La uso para espesar cremas y funciona muy bien."],
      [5, "Celíaco satisfecho", "Por fin una harina alternativa con buen sabor."],
    ]),
  },
  {
    slug: "remolacha-en-polvo",
    name: "Remolacha en polvo",
    category: "harinas-y-polvos-sin-gluten",
    preTitle: "Ingrediente funcional",
    slogan: "Color y nutrientes en formato estable.",
    productColor: "#8E2D52",
    badge: "Sin gluten",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Remolacha deshidratada y molida hasta obtener un polvo estable, homogéneo y de color intenso.",
    description:
      "Remolacha seleccionada, lavada y preparada antes de ingresar a deshidratación, molienda y tamizado, obteniendo un polvo estable y de color intenso.",
    longDescription:
      "Nuestra tecnología permite convertir determinadas materias primas agrícolas en polvos estables, homogéneos y versátiles. La remolacha es seleccionada, lavada y preparada antes de reducir progresivamente su humedad mediante deshidratación, para luego pasar por molienda y tamizado.\n\nProceso: Selección → Lavado → Corte → Deshidratación → Molienda → Tamizado → Empacado.",
    variants: v([["250 g", 7.0]]),
    ingredients: ing([
      ["Remolacha", "100% remolacha deshidratada y molida."],
      ["Betalaínas", "Pigmentos naturales responsables del color intenso característico."],
      ["Fibra dietética", "Fracción fibrosa concentrada tras la deshidratación."],
    ]),
    benefits: ben([
      ["Colorante natural de alimentos", "sparkle"],
      ["Libre de gluten", "shield"],
      ["Polvo estable y homogéneo", "flask"],
      ["100% remolacha", "leaf"],
      ["Formato de 250 g", "check-circle"],
    ]),
    usageSteps: use([
      "Disuelve 1 cucharadita en agua, jugo o batidos.",
      "Úsalo como colorante natural en masas, cremas y glaseados.",
      "Incorpóralo en sopas y salsas para aportar color y sabor terroso.",
      "Conserva en recipiente hermético protegido de la luz.",
    ]),
    reviews: rev([
      [5, "Color impresionante", "Un poquito tiñe muchísimo. Rinde bastante."],
      [4, "Muy útil", "Lo uso en batidos pre-entreno."],
      [5, "Natural de verdad", "Sin sabores raros ni aditivos."],
    ]),
  },

  // ── ACEITES VEGETALES ─────────────────────────────────────────────────────
  {
    slug: "aceite-de-coco",
    name: "Aceite de coco",
    category: "aceites-vegetales",
    preTitle: "Prensado en frío",
    slogan: "Extraemos el aceite mediante fuerza mecánica.",
    productColor: "#E4D7C3",
    badge: "Destacado",
    badgeColor: "#B7791F",
    shortDescription:
      "Aceite obtenido de coco seleccionado mediante extracción mecánica, decantado y filtrado.",
    description:
      "Obtenido a partir de coco seleccionado mediante extracción mecánica. Su aroma, textura y comportamiento característicos provienen directamente de la composición natural del coco.",
    longDescription:
      "Utilizamos procesos de extracción mecánica por prensado, buscando minimizar la exposición innecesaria a altas temperaturas durante la extracción. La presión mecánica rompe progresivamente las estructuras de la materia prima y permite liberar el aceite contenido naturalmente en ella. Posteriormente realizamos decantación, acondicionamiento y filtración.\n\nProceso: Materia prima → Preparación → Prensado → Decantación → Filtración → Envasado.",
    variants: v([
      ["35 ml", 3.0],
      ["150 ml", 5.0],
      ["250 ml", 8.0],
      ["500 ml", 11.0],
      ["750 ml", 20.0],
      ["1000 ml", 27.0],
    ]),
    ingredients: ing([
      ["Aceite de coco", "100% aceite de coco obtenido por prensado mecánico."],
      ["Ácido láurico", "Ácido graso predominante en la composición natural del coco."],
      ["Triglicéridos de cadena media", "Fracción lipídica característica del aceite de coco."],
    ]),
    benefits: ben([
      ["Prensado en frío", "flask"],
      ["Seis presentaciones disponibles", "check-circle"],
      ["Uso culinario y cosmético", "sparkle"],
      ["Sin refinar", "leaf"],
      ["Decantado y filtrado", "shield"],
    ]),
    usageSteps: use([
      "Para cocinar: usa 1 a 2 cucharadas como sustituto de aceites refinados.",
      "Para la piel: aplica una pequeña cantidad y masajea hasta absorción.",
      "Para el cabello: aplica de medios a puntas, deja actuar 20 minutos y enjuaga.",
      "Se solidifica por debajo de 24 °C. Es normal: entíbialo para volverlo líquido.",
    ]),
    reviews: rev([
      [5, "Calidad notable", "Aroma real a coco, nada que ver con los refinados de supermercado."],
      [5, "Compro el litro", "La presentación de 1000 ml sale mucho mejor de precio."],
      [4, "Muy bueno", "Lo uso para cocinar y para la piel."],
    ]),
  },
  {
    slug: "aceite-de-linaza",
    name: "Aceite de linaza",
    category: "aceites-vegetales",
    preTitle: "Prensado en frío",
    slogan: "Semillas prensadas, reposadas y filtradas.",
    productColor: "#B99A3E",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Aceite de semillas de linaza obtenido por prensado mecánico, con reposo y filtración antes del envasado.",
    description:
      "Seleccionamos semillas de linaza y las sometemos a prensado mecánico para liberar el aceite almacenado naturalmente en ellas.",
    longDescription:
      "Seleccionamos semillas de linaza y las sometemos a prensado mecánico para liberar el aceite almacenado naturalmente en ellas. Después de la extracción realizamos procesos de reposo y filtración antes del envasado.\n\nProceso: Materia prima → Preparación → Prensado → Decantación → Filtración → Envasado.",
    variants: v([["250 ml", 12.0], ["500 ml", 20.0]]),
    ingredients: ing([
      ["Aceite de linaza", "100% aceite de semilla de linaza prensado en frío."],
      ["Ácido alfa-linolénico", "Ácido graso omega-3 predominante en la semilla de linaza."],
      ["Vitamina E natural", "Antioxidante presente de forma natural en el aceite."],
    ]),
    benefits: ben([
      ["Prensado en frío", "flask"],
      ["Fuente natural de omega-3", "heart"],
      ["Reposado y filtrado", "shield"],
      ["Dos presentaciones", "check-circle"],
      ["Sin refinar", "leaf"],
    ]),
    usageSteps: use([
      "Consúmelo en frío: 1 cucharada al día directa o sobre ensaladas.",
      "No lo uses para freír ni cocinar a alta temperatura.",
      "Refrigéralo tras abrir y consúmelo en un plazo corto.",
      "Protégelo de la luz y el calor.",
    ]),
    reviews: rev([
      [5, "Fresco", "Sin el sabor rancio que suelen tener otros aceites de linaza."],
      [4, "Buen producto", "Se nota el prensado en frío."],
      [5, "Lo tomo a diario", "Una cucharada en la ensalada y listo."],
    ]),
  },
  {
    slug: "aceite-de-ajonjoli",
    name: "Aceite de ajonjolí",
    category: "aceites-vegetales",
    preTitle: "Prensado en frío",
    slogan: "El aroma y sabor de su materia prima de origen.",
    productColor: "#A8763C",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Aceite extraído mecánicamente a partir de semillas de ajonjolí seleccionadas.",
    description:
      "Extraído mecánicamente a partir de semillas de ajonjolí seleccionadas. Un aceite vegetal con el aroma y sabor característicos de su materia prima de origen.",
    longDescription:
      "Las semillas de ajonjolí son seleccionadas y preparadas antes del prensado mecánico. La presión rompe progresivamente las estructuras de la semilla y libera el aceite contenido naturalmente en ella, que luego pasa por decantación y filtración.\n\nProceso: Materia prima → Preparación → Prensado → Decantación → Filtración → Envasado.",
    variants: v([["250 ml", 13.0], ["500 ml", 25.0]]),
    ingredients: ing([
      ["Aceite de ajonjolí", "100% aceite de semilla de ajonjolí prensado mecánicamente."],
      ["Sesamol y sesamina", "Compuestos antioxidantes característicos del ajonjolí."],
      ["Ácidos grasos insaturados", "Fracción lipídica predominante de la semilla."],
    ]),
    benefits: ben([
      ["Prensado mecánico", "flask"],
      ["Aroma y sabor característicos", "sparkle"],
      ["Decantado y filtrado", "shield"],
      ["Dos presentaciones", "check-circle"],
      ["Semillas seleccionadas", "leaf"],
    ]),
    usageSteps: use([
      "Úsalo en frío para aliñar ensaladas, arroces y platos asiáticos.",
      "Añádelo al final de la cocción para preservar su aroma.",
      "También puede aplicarse en masajes corporales.",
      "Conserva en lugar fresco, protegido de la luz.",
    ]),
    reviews: rev([
      [5, "Aroma intenso", "Perfecto para cocina asiática. Poquito basta."],
      [4, "Muy bueno", "Se nota la calidad de la semilla."],
      [5, "Recomendado", "Lo uso en todos mis salteados."],
    ]),
  },
  {
    slug: "aceite-de-aguacate",
    name: "Aceite de aguacate",
    category: "aceites-vegetales",
    preTitle: "Extracción mecánica",
    slogan: "La fracción oleosa del aguacate, acondicionada y filtrada.",
    productColor: "#5E7A3A",
    badge: "Destacado",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Aceite obtenido mecánicamente a partir de aguacate preparado, con acondicionamiento y filtración posteriores.",
    description:
      "El aguacate es preparado cuidadosamente antes de ingresar al proceso de extracción. Mediante operaciones mecánicas se obtiene su fracción oleosa.",
    longDescription:
      "El aguacate es preparado cuidadosamente antes de ingresar al proceso de extracción. Mediante operaciones mecánicas se obtiene su fracción oleosa, que posteriormente pasa por etapas de acondicionamiento y filtración.\n\nProceso: Materia prima → Preparación → Prensado → Decantación → Filtración → Envasado.",
    variants: v([["250 ml", 8.0], ["500 ml", 15.0], ["1000 ml", 27.0]]),
    ingredients: ing([
      ["Aceite de aguacate", "100% aceite obtenido de la pulpa de aguacate."],
      ["Ácido oleico", "Ácido graso monoinsaturado predominante en el aguacate."],
      ["Vitamina E natural", "Antioxidante presente de forma natural en la fracción oleosa."],
    ]),
    benefits: ben([
      ["Extracción mecánica", "flask"],
      ["Apto para cocción a mayor temperatura", "check-circle"],
      ["Rico en ácido oleico", "heart"],
      ["Tres presentaciones", "sparkle"],
      ["Acondicionado y filtrado", "shield"],
    ]),
    usageSteps: use([
      "Úsalo para saltear, hornear o asar: tolera bien el calor.",
      "En frío, aliña ensaladas y verduras.",
      "También puede usarse en la piel como humectante.",
      "Conserva en lugar fresco y protegido de la luz.",
    ]),
    reviews: rev([
      [5, "Excelente para cocinar", "Aguanta el sartén sin humear como otros aceites."],
      [5, "Sabor suave", "No interfiere con el sabor de los platos."],
      [4, "Buen litro", "La presentación de 1000 ml rinde muchísimo."],
    ]),
  },

  // ── ACEITES ESENCIALES ────────────────────────────────────────────────────
  {
    slug: "aceite-de-oregano",
    name: "Aceite de orégano",
    category: "aceites-esenciales",
    preTitle: "Destilación por arrastre de vapor",
    slogan: "Ingeniería aplicada a las plantas aromáticas.",
    productColor: "#4A6B3A",
    badge: "Destacado",
    badgeColor: "#1F8F6B",
    shortDescription:
      "Aceite esencial obtenido por destilación de orégano seleccionado, separado del hidrolato y acondicionado.",
    description:
      "Obtenido mediante destilación de orégano cuidadosamente seleccionado. El proceso permite recuperar la fracción volátil de la planta.",
    longDescription:
      "El vapor entra en contacto con el material vegetal y transporta parte de sus componentes volátiles. La mezcla de vapor y compuestos aromáticos pasa por un sistema de condensación. Al disminuir su temperatura obtenemos una fase líquida compuesta principalmente por hidrolato y aceite esencial, que posteriormente son separados y acondicionados.\n\nProceso: Planta → Vapor → Extracción → Condensación → Separación → Aceite esencial.",
    variants: v([["30 ml", 15.0], ["50 ml", 25.0]]),
    ingredients: ing([
      ["Aceite esencial de orégano", "Fracción volátil obtenida por arrastre de vapor."],
      ["Carvacrol", "Compuesto fenólico predominante en el aceite esencial de orégano."],
      ["Timol", "Fenol natural presente en la fracción volátil de la planta."],
    ]),
    benefits: ben([
      ["Destilación por arrastre de vapor", "flask"],
      ["Producto concentrado", "sparkle"],
      ["Aroma intenso", "wind"],
      ["Dos presentaciones", "check-circle"],
      ["Orégano seleccionado", "leaf"],
    ]),
    usageSteps: use([
      "Diluye 2 a 3 gotas en agua o jugo antes de consumir.",
      "Para uso aromático, añade 3 a 4 gotas en un difusor.",
      "Para uso tópico, dilúyelo siempre en un aceite portador antes de aplicar.",
      "Producto concentrado: no lo apliques puro sobre la piel ni en mucosas.",
    ]),
    reviews: rev([
      [5, "Muy concentrado", "Con dos gotas alcanza. El frasco rinde meses."],
      [5, "Aroma potente", "Se nota que es destilado real, no diluido."],
      [4, "Buen producto", "Fuerte, hay que diluirlo bien."],
    ]),
  },
  {
    slug: "aceite-de-clavo-de-olor",
    name: "Aceite de clavo de olor",
    category: "aceites-esenciales",
    preTitle: "Destilación por arrastre de vapor",
    slogan: "El intenso aroma especiado del clavo.",
    productColor: "#6B3A2A",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Aceite esencial obtenido por destilación de clavo de olor, con condensación y separación de fases controladas.",
    description:
      "El clavo de olor es sometido a un proceso de destilación para extraer sus componentes volátiles. Los vapores son condensados y las fases resultantes se separan cuidadosamente.",
    longDescription:
      "El clavo de olor es sometido a destilación por arrastre de vapor para extraer sus componentes volátiles. Después de la extracción, los vapores son condensados y las fases resultantes se separan cuidadosamente. El producto obtenido posee el intenso aroma especiado característico del clavo de olor.\n\nProceso: Planta → Vapor → Extracción → Condensación → Separación → Aceite esencial.",
    variants: v([["30 ml", 15.0], ["50 ml", 25.0]]),
    ingredients: ing([
      ["Aceite esencial de clavo de olor", "Fracción volátil obtenida por arrastre de vapor."],
      ["Eugenol", "Compuesto fenólico predominante, responsable del aroma especiado."],
      ["Cariofileno", "Sesquiterpeno presente naturalmente en el clavo."],
    ]),
    benefits: ben([
      ["Destilación por arrastre de vapor", "flask"],
      ["Aroma especiado intenso", "wind"],
      ["Producto concentrado", "sparkle"],
      ["Dos presentaciones", "check-circle"],
      ["Separación de fases controlada", "shield"],
    ]),
    usageSteps: use([
      "Para uso aromático, añade 2 a 3 gotas en un difusor.",
      "Para uso tópico, dilúyelo en un aceite portador antes de aplicar.",
      "Puede aplicarse diluido con un hisopo en la zona bucal según indicación profesional.",
      "Producto concentrado: no lo apliques puro sobre la piel.",
    ]),
    reviews: rev([
      [5, "Muy potente", "Aroma inconfundible. Basta una gota."],
      [4, "Cumple", "Buena calidad de destilado."],
      [5, "Excelente", "Lo uso en el difusor y perfuma toda la casa."],
    ]),
  },

  // ── CÁPSULAS ──────────────────────────────────────────────────────────────
  {
    slug: "capsulas-aceite-de-coco-y-oregano",
    name: "Cápsulas de aceite de coco + orégano",
    category: "capsulas-de-aceites",
    preTitle: "Dos tecnologías de extracción",
    slogan: "De la extracción a una dosis precisa.",
    productColor: "#3F6B4F",
    badge: "Destacado",
    badgeColor: "#1F8F6B",
    shortDescription:
      "90 cápsulas de 400 mg que combinan aceite de coco por prensado y aceite de orégano por destilación.",
    description:
      "Aceite vegetal de coco obtenido mediante extracción mecánica combinado con aceite de orégano obtenido mediante destilación, formulados y dosificados antes del encapsulado.",
    longDescription:
      "Dos tecnologías de extracción reunidas en una misma formulación. Los componentes son formulados y dosificados antes del proceso de encapsulado para conseguir uniformidad entre unidades.\n\nProceso: Extracción → Filtración → Formulación → Dosificación → Encapsulado → Control → Envasado.",
    variants: v([["90 cápsulas · 400 mg", 20.0]]),
    ingredients: ing([
      ["Aceite de coco", "Obtenido por extracción mecánica y filtrado antes de la formulación."],
      ["Aceite esencial de orégano", "Obtenido por destilación por arrastre de vapor."],
      ["Cubierta de la cápsula", "Material de encapsulado apto para uso alimentario."],
    ]),
    benefits: ben([
      ["Dosificación uniforme entre unidades", "flask"],
      ["Combina prensado y destilación", "sparkle"],
      ["90 cápsulas por frasco", "check-circle"],
      ["Sin necesidad de diluir", "shield"],
      ["Formato práctico de consumo", "heart"],
    ]),
    usageSteps: use([
      "Toma 1 cápsula al día con un vaso de agua, preferiblemente con las comidas.",
      "No excedas la dosis diaria recomendada.",
      "Conserva el frasco cerrado en lugar fresco y seco.",
      "Consulta a tu profesional de salud si estás embarazada, lactando o bajo tratamiento.",
    ]),
    reviews: rev([
      [5, "Mucho más cómodo", "Sin el sabor fuerte del aceite líquido."],
      [5, "Rinde 3 meses", "90 cápsulas dan para bastante tiempo."],
      [4, "Buen producto", "Cápsulas bien selladas, ninguna rota."],
    ]),
  },
  {
    slug: "capsulas-aceite-de-oregano",
    name: "Cápsulas de aceite de orégano",
    category: "capsulas-de-aceites",
    preTitle: "Dosis controlada",
    slogan: "El orégano destilado, en una dosis precisa.",
    productColor: "#4A6B3A",
    badge: null,
    badgeColor: null,
    shortDescription:
      "90 cápsulas de 400 mg desarrolladas a partir de una formulación con aceite de orégano.",
    description:
      "Una presentación encapsulada desarrollada a partir de una formulación con aceite de orégano. El proceso de dosificación y encapsulado permite controlar la cantidad incorporada en cada unidad.",
    longDescription:
      "Primero obtenemos el aceite esencial mediante destilación por arrastre de vapor. Posteriormente los ingredientes son acondicionados y formulados en proporciones definidas antes de ingresar al proceso de encapsulado.\n\nProceso: Extracción → Filtración → Formulación → Dosificación → Encapsulado → Control → Envasado.",
    variants: v([["90 cápsulas · 400 mg", 20.0]]),
    ingredients: ing([
      ["Aceite esencial de orégano", "Obtenido por destilación por arrastre de vapor y filtrado."],
      ["Carvacrol", "Compuesto fenólico predominante del aceite de orégano."],
      ["Cubierta de la cápsula", "Material de encapsulado apto para uso alimentario."],
    ]),
    benefits: ben([
      ["Cantidad controlada por unidad", "flask"],
      ["Sin el sabor intenso del aceite líquido", "check-circle"],
      ["90 cápsulas por frasco", "sparkle"],
      ["Formato portátil", "heart"],
      ["Control de proceso en cada lote", "shield"],
    ]),
    usageSteps: use([
      "Toma 1 cápsula al día con un vaso de agua, preferiblemente con las comidas.",
      "No excedas la dosis diaria recomendada.",
      "Conserva el frasco cerrado en lugar fresco y seco.",
      "Consulta a tu profesional de salud si estás embarazada, lactando o bajo tratamiento.",
    ]),
    reviews: rev([
      [5, "Práctico", "Mucho mejor que andar diluyendo gotas."],
      [4, "Cumple", "Sin regusto ni reflujo."],
      [5, "Repito", "Segunda compra ya."],
    ]),
  },
  {
    slug: "capsulas-aceite-de-coco",
    name: "Cápsulas de aceite de coco",
    category: "capsulas-de-aceites",
    preTitle: "Dosis controlada",
    slogan: "Un aceite vegetal en presentación práctica y uniforme.",
    productColor: "#C9B79C",
    badge: null,
    badgeColor: null,
    shortDescription:
      "90 cápsulas de 1000 mg de aceite de coco obtenido por extracción mecánica.",
    description:
      "Aceite de coco obtenido mediante extracción mecánica, posteriormente acondicionado y llevado a un proceso de dosificación y encapsulado.",
    longDescription:
      "Tecnología aplicada para convertir un aceite vegetal en una presentación práctica y uniforme. El aceite se obtiene por prensado mecánico, se acondiciona y se dosifica antes del encapsulado, con control entre unidades.\n\nProceso: Extracción → Filtración → Formulación → Dosificación → Encapsulado → Control → Envasado.",
    variants: v([["90 cápsulas · 1000 mg", 20.0]]),
    ingredients: ing([
      ["Aceite de coco", "100% aceite de coco obtenido por extracción mecánica."],
      ["Triglicéridos de cadena media", "Fracción lipídica característica del coco."],
      ["Cubierta de la cápsula", "Material de encapsulado apto para uso alimentario."],
    ]),
    benefits: ben([
      ["1000 mg por cápsula", "check-circle"],
      ["Dosificación uniforme", "flask"],
      ["Sin necesidad de medir ni entibiar", "sparkle"],
      ["90 cápsulas por frasco", "shield"],
      ["Aceite de prensado mecánico", "leaf"],
    ]),
    usageSteps: use([
      "Toma 1 cápsula al día con un vaso de agua, preferiblemente con las comidas.",
      "No excedas la dosis diaria recomendada.",
      "Conserva el frasco cerrado en lugar fresco y seco.",
      "Consulta a tu profesional de salud si estás bajo tratamiento médico.",
    ]),
    reviews: rev([
      [5, "Muy cómodo", "Ideal para quien no soporta la textura del aceite."],
      [4, "Buen gramaje", "1000 mg por cápsula es bastante."],
      [5, "Excelente", "Cápsulas de buen tamaño, fáciles de tragar."],
    ]),
  },

  // ── SALES MARINAS ─────────────────────────────────────────────────────────
  {
    slug: "sal-marina-en-grano",
    name: "Sal marina en grano",
    category: "sales-marinas",
    preTitle: "Del océano a tu mesa",
    slogan: "Cristales seleccionados de granulometría mayor.",
    productColor: "#8FA9B5",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Cristales de sal marina seleccionados y clasificados para conservar una granulometría mayor.",
    description:
      "Cristales de sal marina cuidadosamente seleccionados y clasificados para conservar una granulometría mayor. Una presentación ideal para diferentes aplicaciones gastronómicas.",
    longDescription:
      "Nuestra sal comienza en el mar. Mediante procesos de concentración y cristalización se obtienen los cristales de sal que posteriormente son recolectados y trasladados para su procesamiento. La materia prima pasa por etapas destinadas a separar impurezas, seleccionar y clasificar los cristales.\n\nProceso: Origen marino → Recolección → Limpieza → Selección → Clasificación → Empacado.",
    variants: v([["500 g", 3.5], ["1 kg", 6.0]]),
    ingredients: ing([
      ["Sal marina", "100% cristales de origen marino, sin antiaglomerantes."],
      ["Minerales traza", "Elementos presentes de forma natural en el agua de mar."],
    ]),
    benefits: ben([
      ["Granulometría mayor", "flask"],
      ["Sin antiaglomerantes", "shield"],
      ["Origen marino", "droplet"],
      ["Dos presentaciones", "check-circle"],
      ["Limpieza y clasificación controladas", "leaf"],
    ]),
    usageSteps: use([
      "Úsala en molinillo para sazonar al momento de servir.",
      "Ideal para carnes, asados y costras de sal.",
      "También apta para salmueras y conservas.",
      "Conserva en recipiente hermético en lugar seco.",
    ]),
    reviews: rev([
      [5, "Grano parejo", "Perfecto para el molinillo."],
      [4, "Buena sal", "Sabor limpio, sin amargor."],
      [5, "El kilo rinde", "Excelente relación precio-cantidad."],
    ]),
  },
  {
    slug: "sal-marina-fina",
    name: "Sal marina fina",
    category: "sales-marinas",
    preTitle: "Del océano a tu mesa",
    slogan: "Granulometría fina y uniforme.",
    productColor: "#B7C7CE",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Sal marina procesada mediante reducción y clasificación de tamaño hasta una granulometría fina y uniforme.",
    description:
      "Nuestra sal marina es procesada mediante reducción y clasificación de tamaño hasta alcanzar una granulometría más fina y uniforme.",
    longDescription:
      "Tras la recolección, limpieza y selección de los cristales de origen marino, la sal pasa por procesos de molienda y clasificación granulométrica hasta obtener una textura fina y homogénea.\n\nProceso: Origen marino → Recolección → Limpieza → Selección → Clasificación → Molienda → Empacado.",
    variants: v([["500 g", 3.5], ["1 kg", 6.0]]),
    ingredients: ing([
      ["Sal marina", "100% cristales de origen marino molidos, sin antiaglomerantes."],
      ["Minerales traza", "Elementos presentes de forma natural en el agua de mar."],
    ]),
    benefits: ben([
      ["Granulometría fina y uniforme", "flask"],
      ["Se disuelve con facilidad", "droplet"],
      ["Sin antiaglomerantes", "shield"],
      ["Dos presentaciones", "check-circle"],
      ["Origen marino", "leaf"],
    ]),
    usageSteps: use([
      "Úsala para sazonar durante la cocción.",
      "Ideal para masas, panificación y repostería.",
      "Se disuelve rápido en caldos, sopas y salsas.",
      "Conserva en recipiente hermético en lugar seco.",
    ]),
    reviews: rev([
      [5, "Muy fina", "Se disuelve al instante en las masas."],
      [4, "Buen producto", "Sin aditivos, como debe ser."],
      [5, "Reemplacé la comercial", "Sabor mucho más limpio."],
    ]),
  },

  // ── CACAO DE PALANDA ──────────────────────────────────────────────────────
  {
    slug: "pasta-de-cacao",
    name: "Pasta de cacao",
    category: "cacao-de-palanda",
    preTitle: "Cacao de origen Palanda",
    slogan: "El cacao convertido en una masa intensa.",
    productColor: "#4B2B1E",
    badge: "Origen",
    badgeColor: "#8A5CF6",
    shortDescription:
      "Granos procesados y molidos hasta formar una masa fluida, también conocida como licor de cacao.",
    description:
      "Los granos procesados son transformados mediante molienda. A medida que reducimos el tamaño de las partículas, la manteca naturalmente presente contribuye a formar una masa fluida.",
    longDescription:
      "Nuestro cacao nace en Palanda, Zamora Chinchipe. Tras la cosecha y selección de las mazorcas, extraemos los granos y comienza la fermentación, donde ocurren las transformaciones bioquímicas que desarrollan los precursores del aroma, sabor y color. Los granos se secan, tuestan y descascarillan antes de la molienda que da origen a la pasta.\n\nProceso: Cosecha → Selección → Fermentación → Secado → Tostado → Descascarillado → Molienda.",
    variants: v([["1 kg", 18.0]]),
    ingredients: ing([
      ["Cacao de Palanda", "100% grano de cacao fermentado, secado y tostado."],
      ["Manteca de cacao natural", "Fracción grasa propia del grano, no añadida."],
      ["Sólidos de cacao", "Fracción no grasa responsable del color y sabor intensos."],
    ]),
    benefits: ben([
      ["100% cacao, sin azúcar", "shield"],
      ["Origen Palanda, Zamora Chinchipe", "leaf"],
      ["Fermentación controlada", "flask"],
      ["Formato profesional de 1 kg", "check-circle"],
      ["Base para chocolatería", "sparkle"],
    ]),
    usageSteps: use([
      "Derrite a baño maría a temperatura suave, sin superar los 45 °C.",
      "Úsala como base para elaborar chocolate, coberturas y rellenos.",
      "Ralla una porción para bebidas de cacao caliente.",
      "Conserva en lugar fresco y seco, protegida de olores fuertes.",
    ]),
    reviews: rev([
      [5, "Cacao de verdad", "Intenso y con notas frutales. Se nota el origen."],
      [5, "Para chocolatería", "Trabajo con ella en mi taller y responde muy bien."],
      [4, "Buen kilo", "Presentación práctica para producción."],
    ]),
  },
  {
    slug: "nibs-de-cacao",
    name: "Nibs de cacao",
    category: "cacao-de-palanda",
    preTitle: "Cacao de origen Palanda",
    slogan: "Cacao en una de sus formas más directas.",
    productColor: "#5C3A26",
    badge: "Origen",
    badgeColor: "#8A5CF6",
    shortDescription:
      "Fragmentos de grano obtenidos tras el procesamiento y descascarillado. Textura crujiente y sabor intenso.",
    description:
      "Después del procesamiento y descascarillado del grano obtenemos pequeños fragmentos conocidos como nibs. Una presentación con textura crujiente y el sabor intenso característico del cacao.",
    longDescription:
      "Tras la cosecha y selección de mazorcas en Palanda, los granos pasan por fermentación y secado. Luego son tostados y descascarillados, obteniendo los fragmentos de grano conocidos como nibs.\n\nProceso: Cosecha → Selección → Fermentación → Secado → Tostado → Descascarillado.",
    variants: v([["1 kg", 15.0]]),
    ingredients: ing([
      ["Cacao de Palanda", "100% fragmentos de grano de cacao tostado."],
      ["Fibra natural", "Fracción fibrosa presente en el grano de cacao."],
      ["Manteca de cacao natural", "Fracción grasa propia del grano, no añadida."],
    ]),
    benefits: ben([
      ["100% cacao, sin azúcar", "shield"],
      ["Textura crujiente", "sparkle"],
      ["Origen Palanda", "leaf"],
      ["Formato de 1 kg", "check-circle"],
      ["Tostado y descascarillado controlados", "flask"],
    ]),
    usageSteps: use([
      "Espolvoréalos sobre yogur, avena, batidos o helados.",
      "Incorpóralos en repostería, granolas y barras energéticas.",
      "Úsalos como topping crujiente en postres.",
      "Conserva en recipiente hermético en lugar fresco y seco.",
    ]),
    reviews: rev([
      [5, "Crujientes y aromáticos", "Nada de amargor desagradable."],
      [4, "Muy buenos", "Los uso en el desayuno a diario."],
      [5, "Calidad de origen", "Se nota la fermentación bien hecha."],
    ]),
  },
  {
    slug: "manteca-de-cacao",
    name: "Manteca de cacao",
    category: "cacao-de-palanda",
    preTitle: "Cacao de origen Palanda",
    slogan: "La fracción grasa natural del grano.",
    productColor: "#E6D5B8",
    badge: null,
    badgeColor: null,
    shortDescription:
      "Fracción grasa separada de los sólidos del cacao mediante prensado de la pasta.",
    description:
      "La pasta de cacao contiene naturalmente una importante fracción de grasa. Mediante prensado aplicamos presión para separar parte de esa fracción grasa de los sólidos del cacao.",
    longDescription:
      "Partimos de la pasta de cacao elaborada con grano de Palanda. Mediante prensado aplicamos presión para separar la fracción grasa de los sólidos, obteniendo la manteca de cacao.\n\nProceso: Cosecha → Fermentación → Secado → Tostado → Molienda → Prensado.",
    variants: v([["35 g", 3.0], ["150 g", 5.5], ["1 kg", 22.0]]),
    ingredients: ing([
      ["Manteca de cacao", "100% fracción grasa obtenida por prensado de pasta de cacao."],
      ["Ácido esteárico y oleico", "Ácidos grasos predominantes en la manteca de cacao."],
      ["Aroma natural de cacao", "Notas propias del grano, conservadas en la fracción grasa."],
    ]),
    benefits: ben([
      ["Obtenida por prensado", "flask"],
      ["Tres presentaciones", "check-circle"],
      ["Uso alimentario y cosmético", "sparkle"],
      ["Origen Palanda", "leaf"],
      ["Sin refinar", "shield"],
    ]),
    usageSteps: use([
      "Derrite a baño maría a temperatura suave para chocolatería.",
      "Úsala como base de bálsamos, cremas y labiales caseros.",
      "Aplícala directamente sobre la piel como emoliente.",
      "Conserva en lugar fresco y seco, protegida de olores fuertes.",
    ]),
    reviews: rev([
      [5, "Aroma delicioso", "Huele a cacao real, no a nada neutro."],
      [5, "La uso en cosmética", "Perfecta para mis bálsamos artesanales."],
      [4, "Buen producto", "La de 150 g es el formato ideal para casa."],
    ]),
  },
  {
    slug: "cacao-en-polvo",
    name: "Cacao en polvo",
    category: "cacao-de-palanda",
    preTitle: "Cacao de origen Palanda",
    slogan: "De la torta de cacao a partículas finas.",
    productColor: "#6B4226",
    badge: "Destacado",
    badgeColor: "#B7791F",
    shortDescription:
      "Torta de cacao molida y tamizada hasta obtener partículas pequeñas y uniformes.",
    description:
      "Después del prensado queda una fracción sólida conocida como torta de cacao. Esta torta es reducida mediante molienda y posteriormente clasificada mediante tamizado.",
    longDescription:
      "Después del prensado que separa la manteca queda una fracción sólida conocida como torta de cacao. Esta torta es reducida mediante molienda y posteriormente clasificada mediante tamizado, obteniendo partículas mucho más pequeñas y uniformes.\n\nProceso: Cosecha → Fermentación → Secado → Tostado → Molienda → Prensado → Molienda → Tamizado.",
    variants: v([["250 g", 6.0], ["500 g", 10.0], ["1 kg", 18.0]]),
    ingredients: ing([
      ["Cacao en polvo", "100% torta de cacao molida y tamizada. Sin azúcar."],
      ["Sólidos de cacao", "Fracción no grasa responsable del color y el sabor intenso."],
      ["Flavonoides naturales", "Compuestos presentes de forma natural en el cacao."],
    ]),
    benefits: ben([
      ["100% cacao, sin azúcar añadida", "shield"],
      ["Molienda y tamizado finos", "flask"],
      ["Tres presentaciones", "check-circle"],
      ["Origen Palanda", "leaf"],
      ["Versátil en cocina y repostería", "sparkle"],
    ]),
    usageSteps: use([
      "Disuelve 1 a 2 cucharaditas en leche o agua caliente.",
      "Incorpóralo en batidos, avena, yogur y postres.",
      "Úsalo en repostería tamizándolo junto con los secos.",
      "Conserva en recipiente hermético, protegido de la humedad.",
    ]),
    reviews: rev([
      [5, "Intenso y aromático", "Muy superior a los cacaos de supermercado."],
      [5, "Sin azúcar, como pedí", "100% cacao real, se nota en el sabor."],
      [4, "Muy bueno", "El kilo es la mejor compra por precio."],
    ]),
  },
  {
    slug: "cacao-100-refinado",
    name: "Cacao 100% refinado",
    category: "cacao-de-palanda",
    preTitle: "Cacao de origen Palanda",
    slogan: "Cacao. Nada más.",
    productColor: "#3B2318",
    badge: "Origen",
    badgeColor: "#8A5CF6",
    shortDescription:
      "Cacao procesado, molido y refinado hasta obtener una textura considerablemente más fina y uniforme.",
    description:
      "Partimos del cacao procesado y lo sometemos a etapas de molienda y refinado, reduciendo progresivamente el tamaño de las partículas hasta obtener una textura mucho más fina y uniforme.",
    longDescription:
      "Partimos del cacao procesado y lo sometemos a etapas de molienda y refinado. Durante el refinado reducimos progresivamente el tamaño de las partículas hasta obtener una textura considerablemente más fina y uniforme.\n\nSin necesidad de esconder su origen. Sin perder su identidad. 100% cacao de origen Palanda.\n\nProceso: Cosecha → Fermentación → Secado → Tostado → Molienda → Refinado → Tamizado.",
    variants: v([["75 g", 3.0], ["1 kg", 25.0]]),
    ingredients: ing([
      ["Cacao de Palanda", "100% cacao. Sin azúcar, sin leche, sin aditivos."],
      ["Manteca de cacao natural", "Fracción grasa propia del grano, no añadida."],
      ["Sólidos de cacao refinados", "Partículas reducidas por refinado hasta textura uniforme."],
    ]),
    benefits: ben([
      ["100% cacao, sin aditivos", "shield"],
      ["Textura fina y uniforme", "flask"],
      ["Origen Palanda declarado", "leaf"],
      ["Dos presentaciones", "check-circle"],
      ["Refinado progresivo", "sparkle"],
    ]),
    usageSteps: use([
      "Consúmelo directamente en porciones pequeñas.",
      "Derrítelo a baño maría para coberturas y rellenos.",
      "Rállalo sobre postres, cafés o frutas.",
      "Conserva entre 16 °C y 20 °C, protegido de la humedad y los olores fuertes.",
    ]),
    reviews: rev([
      [5, "Puro cacao", "Amargo, complejo y sin nada añadido. Excelente."],
      [5, "Textura impecable", "Nada arenoso, el refinado está muy bien logrado."],
      [4, "Fuerte pero delicioso", "No es para todos, pero para mí es perfecto."],
    ]),
  },
];

module.exports = { BRAND, CTA, categories, products, trustBadgesDefault, certByCategory };
