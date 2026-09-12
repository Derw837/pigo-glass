const domain = [
  'vidrio','cristal','ventana','puerta','mampara','cortina de baño','cortina de bano','espejo','baranda','balcon','balcón','terraza','cubierta','techo',
  'pergola','pérgola','aluminio','cedal','andesia','andesía','templado','laminado','corrediza','corredizo','proyectable','fija','fijo',
  'fachada','división','division','pasamanos','fuente','acuario','curvo','curva','estructura','mosquitero','instalar','instalación',
  'medida','ancho','alto','largo','metro','cotizar','cotización','precio','local','casa','patio','baño','bano','ducha','perfil','perfilería',
  'sellado','silicona','herrajes','pasamano','claraboya','cerramiento','templar','laminar','felpa','rueda','riel','jamba','esquina','t de aluminio','ángulo','angulo'
]

const blocked = [
  'capital de','crea una imagen','crear una imagen','dibujame','dibújame','hazme una imagen','genera una imagen','edita esta imagen',
  'tarea de','resuelve mi tarea','programame','prográmame','codigo python','código python','javascript','receta de','quien es el presidente','quién es el presidente',
  'traduce','poema','historia de la','cuanto es 2+2','cuánto es 2+2','fútbol','futbol','mundial','película','pelicula','canción','cancion','bitcoin','trading'
]

const greeting = ['hola','buenas','buenos dias','buenos días','hey','buenas tardes','buenas noches']

export function preGate(
  text: string,
  selectedCategory?: string,
  hasImage = false,
  previousContext = '',
  activeDomainConversation = false
) {
  const q = text.toLowerCase().trim()
  const context = previousContext.toLowerCase()

  if (!q || greeting.includes(q)) return { allowed: false, kind: 'greeting' as const }
  if (blocked.some(k => q.includes(k))) return { allowed: false, kind: 'blocked' as const }
  if (selectedCategory && selectedCategory !== 'none') return { allowed: true, kind: 'domain' as const }
  if (hasImage) return { allowed: true, kind: 'image' as const }
  if (domain.some(k => q.includes(k))) return { allowed: true, kind: 'domain' as const }

  // Una vez que ya existe un proyecto de vidrio/aluminio activo, respuestas cortas como
  // “negro”, “Cedal”, “6 mm”, un nombre, teléfono o dirección deben poder continuar.
  if (activeDomainConversation && q.length <= 700) return { allowed: true, kind: 'followup' as const }

  const hasDomainContext = domain.some(k => context.includes(k))
  if (hasDomainContext && q.length <= 300) return { allowed: true, kind: 'followup' as const }

  return { allowed: false, kind: 'out' as const }
}
