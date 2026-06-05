export interface Province {
  id: string;
  name: string;
  cities: string[];
}

export const ecuadorProvinces: Province[] = [
  { id: "pic", name: "Pichincha", cities: ["Quito", "Machachi", "Latacunga"] },
  { id: "gua", name: "Guayas", cities: ["Guayaquil", "Samborondón", "Durán"] },
  { id: "azo", name: "Azuay", cities: ["Cuenca", "Gualaceo", "Sigsig"] },
  { id: "mam", name: "Manabí", cities: ["Manta", "Portoviejo", "Junín"] },
  { id: "sua", name: "Sucumbíos", cities: ["Nueva Loja", "El Coca", "Lago Agrio"] },
  { id: "tur", name: "Tungurahua", cities: ["Ambato", "Latacunga", "Pelileo"] },
  { id: "pas", name: "Pastaza", cities: ["Puyo", "Shell"] },
  { id: "mor", name: "Morona Santiago", cities: ["Macas", "Limón"] },
  { id: "zam", name: "Zamora Chinchipe", cities: ["Zamora", "Vilcabamba"] },
  { id: "loj", name: "Loja", cities: ["Loja", "Catamayo"] },
  { id: "los", name: "Los Ríos", cities: ["Babahoyo", "Quevedo"] },
  { id: "san", name: "Santo Domingo", cities: ["Santo Domingo", "La Concordia"] },
  { id: "car", name: "Carchi", cities: ["Tulcán", "Ipiales"] },
  { id: "imb", name: "Imbabura", cities: ["Ibarra", "Otavalo", "Cotacachi"] },
  { id: "ori", name: "Orellana", cities: ["Puerto Francisco de Orellana", "Coca"] },
  { id: "gal", name: "Galápagos", cities: ["Puerto Baquerizo", "Puerto Ayora"] },
  { id: "set", name: "Santa Elena", cities: ["Santa Elena", "Salinas", "La Libertad"] },
];

export function getProvinceNameById(id: string): string | undefined {
  return ecuadorProvinces.find((p) => p.id === id)?.name;
}
