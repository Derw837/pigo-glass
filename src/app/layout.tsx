import type { Metadata } from 'next'
import './globals.css'
import { BRAND_NAME } from '@/lib/brand'
import FloatingAssistant from '@/components/FloatingAssistant'

export const metadata: Metadata = {
  title: `${BRAND_NAME} · Vidrio y aluminio`,
  description: 'Soluciones e instalación de vidrio y aluminio con asesoría para proyectos residenciales y comerciales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <FloatingAssistant />
      </body>
    </html>
  )
}
