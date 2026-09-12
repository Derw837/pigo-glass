import Link from 'next/link'
import { BRAND_SHORT } from '@/lib/brand'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="brand">{BRAND_SHORT} <span>STUDIO</span></div>
        <nav className="admin-menu">
          <Link href="/admin">Resumen</Link>
          <Link href="/admin/solicitudes">Solicitudes</Link>
          <Link href="/admin/materiales">Aluminio</Link>
          <Link href="/admin/precios">Precios</Link>
          <Link href="/admin/recetas">Recetas</Link>
          <Link href="/admin/galeria">Galería</Link>
          <Link href="/admin/contenido">Contenido web</Link>
          <Link href="/admin/vacantes">Vacantes y CV</Link>
          <Link href="/admin/configuracion">Tarifas simples</Link>
          <Link href="/">Ver web</Link>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
