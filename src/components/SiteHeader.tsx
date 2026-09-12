import Link from 'next/link'
import { BRAND_SHORT } from '@/lib/brand'
import OpenAssistantButton from '@/components/OpenAssistantButton'

export default function SiteHeader() {
  return (
    <header className="site-header site-header-v9">
      <div className="container nav">
        <Link href="/" className="brand">{BRAND_SHORT} <span>STUDIO</span></Link>
        <nav className="nav-links">
          <Link href="/#servicios">Servicios</Link>
          <Link href="/galeria">Trabajos</Link>
          <Link href="/nosotros">Empresa</Link>
          <Link href="/trabaja-con-nosotros">Trabaja con nosotros</Link>
          <OpenAssistantButton className="btn primary small">Cotizar proyecto</OpenAssistantButton>
        </nav>
      </div>
    </header>
  )
}
