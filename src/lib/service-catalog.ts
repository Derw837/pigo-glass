export type ServiceCategory = {
  name: string
  slug: string
  short: string
  description: string
  types: string[]
  note?: string
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    name: 'Ventanas',
    slug: 'ventanas',
    short: 'Ventanas para vivienda, oficinas y comercios con distintas formas de apertura y prestaciones.',
    description: 'Fabricamos e instalamos ventanas de aluminio y vidrio adaptadas al uso, la ubicación y el nivel de confort que buscas. Podemos orientar el proyecto hacia ventilación, seguridad, control solar o reducción de ruido.',
    types: ['Corredizas', 'Fijas', 'Proyectables', 'Con vidrio laminado de seguridad', 'Con control solar', 'Con aislamiento acústico'],
    note: 'En zonas accesibles desde planta baja o de mayor exposición podemos recomendar vidrio laminado de seguridad.'
  },
  {
    name: 'Mamparas',
    slug: 'mamparas',
    short: 'Mamparas modernas para baños y divisiones interiores, con soluciones con o sin perfilería.',
    description: 'Realizamos mamparas a medida con un acabado limpio y funcional. Según el diseño pueden resolverse con vidrio templado, sistemas corredizos o abatibles y diferentes niveles de privacidad.',
    types: ['Fijas', 'Corredizas', 'Abatibles', 'Sin marco', 'Con perfilería de aluminio', 'Privacidad translúcida o al ácido'],
    note: 'En zonas de ducha priorizamos soluciones de vidrio de seguridad compatibles con el sistema.'
  },
  {
    name: 'Cortinas de baño',
    slug: 'cortinas-de-bano',
    short: 'Cerramientos de ducha y bañera con opciones elegantes y alternativas para diferentes presupuestos.',
    description: 'Diseñamos e instalamos cortinas de baño en vidrio a medida. La solución recomendada suele ser vidrio templado con herrajes discretos; también podemos evaluar sistemas con aluminio y acabados de privacidad.',
    types: ['Templado sin marco', 'Con aluminio', 'Corredizas', 'Abatibles', 'Translúcidas', 'Decorativas tipo catedral'],
    note: 'La elección final depende de las medidas, la apertura disponible y el sistema de herrajes.'
  },
  {
    name: 'Barandas',
    slug: 'barandas',
    short: 'Barandas de vidrio para terrazas, balcones, escaleras y desniveles.',
    description: 'Instalamos barandas y pasamanos de vidrio con sistemas de fijación adaptados al lugar: perfiles, postes o herrajes puntuales. Al tratarse de protección contra caídas, cada proyecto requiere revisión técnica del anclaje y la composición del vidrio.',
    types: ['Terrazas y balcones', 'Escaleras', 'Botones o herrajes puntuales', 'Perfiles base', 'Vidrio laminado', 'Sistemas de seguridad'],
    note: 'La altura, espesor, composición y anclajes se confirman técnicamente antes de fabricar.'
  },
  {
    name: 'Cubiertas',
    slug: 'cubiertas',
    short: 'Vidrio para cubiertas sobre estructuras existentes y aptas para recibirlo.',
    description: 'Suministramos e instalamos vidrio para cubiertas cuando la estructura de soporte ya existe. Revisamos modulación, apoyos, pendiente, sellado y drenaje para definir una solución segura y durable.',
    types: ['Laminadas de seguridad', 'Con control solar', 'Paños modulados', 'Sellado de juntas', 'Accesorios de fijación', 'Reemplazo de paños'],
    note: 'Para vidrio sobre personas recomendamos revisar una composición de seguridad y no definir el espesor únicamente por chat.'
  },
  {
    name: 'Pérgolas',
    slug: 'pergolas',
    short: 'Instalación de vidrio en pérgolas que ya cuentan con una estructura adecuada.',
    description: 'Completamos pérgolas existentes con vidrio, sellos y accesorios compatibles. Podemos estudiar alternativas de seguridad y control solar buscando un equilibrio entre desempeño, estética y presupuesto.',
    types: ['Vidrio laminado', 'Control solar', 'Paños a medida', 'Sellado', 'Reposición de vidrio', 'Instalación sobre estructura existente'],
    note: 'No ejecutamos la estructura metálica ni obra civil; revisamos la estructura existente antes de instalar.'
  },
  {
    name: 'Divisiones',
    slug: 'divisiones',
    short: 'Divisiones de vidrio para oficinas, locales, hogares y espacios corporativos.',
    description: 'Creamos separaciones transparentes que mantienen la luz y la amplitud del espacio. Podemos combinar paños fijos, puertas, perfilería oscura o natural y soluciones orientadas a privacidad o control acústico.',
    types: ['Oficinas', 'Salas de reuniones', 'Paños piso a techo', 'Puertas de vidrio', 'Perfilería de aluminio', 'Opciones acústicas'],
  },
  {
    name: 'Puertas',
    slug: 'puertas',
    short: 'Puertas de vidrio y aluminio para accesos residenciales, comerciales e interiores.',
    description: 'Instalamos puertas corredizas o abatibles en vidrio y aluminio, seleccionando herrajes, perfilería y vidrio según el tamaño, frecuencia de uso y acabado deseado.',
    types: ['Corredizas', 'Abatibles', 'Vidrio y aluminio', 'Templadas', 'Accesos comerciales', 'Divisiones interiores'],
  },
  {
    name: 'Espejos',
    slug: 'espejos',
    short: 'Espejos fabricados a medida para baños, salas, gimnasios, comercios y decoración.',
    description: 'Suministramos e instalamos espejos a medida con diferentes formatos y terminaciones para integrarlos al espacio con un acabado limpio.',
    types: ['Baños', 'Decorativos', 'Pared completa', 'Gimnasios', 'Locales comerciales', 'A medida'],
  },
  {
    name: 'Proyectos especiales',
    slug: 'proyectos-especiales',
    short: 'Soluciones no estándar relacionadas con vidrio, aluminio y su instalación.',
    description: 'Cuando la idea no encaja en una categoría convencional, revisamos fotos, medidas y referencias para determinar qué parte puede resolverse con vidrio, perfilería y accesorios especializados.',
    types: ['Vidrio curvo', 'Fuentes decorativas', 'Cerramientos especiales', 'Vidrio a medida', 'Reemplazos especiales', 'Ideas de referencia'],
    note: 'Los proyectos especiales pueden requerir visita o estudio antes de emitir una cotización.'
  },
]

export function getServiceCategory(value?: string | null) {
  if (!value) return null
  const decoded = decodeURIComponent(value).trim().toLocaleLowerCase('es')
  return SERVICE_CATEGORIES.find((item) =>
    item.name.toLocaleLowerCase('es') === decoded || item.slug === decoded
  ) || null
}

export function galleryHref(category: string) {
  return `/galeria?categoria=${encodeURIComponent(category)}`
}
