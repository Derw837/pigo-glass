export default function AssistantPreview(){
  return <div className="chat-shell">
    <div className="chat-top">
      <div className="avatar">P</div>
      <div><strong>Asesor PIGO</strong><div style={{fontSize:12,color:'#6b716e'}}>Vidrio · aluminio · instalación</div></div>
    </div>
    <div className="chat-messages">
      <div className="bubble ai">¡Hola! Cuéntame qué quieres hacer. Si tienes medidas o una foto, me la puedes mandar.</div>
      <div className="bubble user">Quiero una ventana fija de 2 m x 1,50 m.</div>
      <div className="bubble ai">Perfecto, ya tengo la medida. ¿En qué color quieres el aluminio y prefieres CEDAL o Andesía? Para un paño de ese tamaño primero te recomendaría revisar una opción de vidrio de seguridad, por ejemplo laminado claro.</div>
      <div className="bubble user">Negro, CEDAL y laminado claro.</div>
    </div>
    <div className="chat-input"><input disabled placeholder="Escribe como se lo dirías a una persona…"/><button>→</button></div>
    <div className="scope-note">Solo atiende trabajos de vidrio, aluminio e instalación en Ecuador.</div>
  </div>
}
