import '@/src/styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <div className="p-3 text-xl bg-blue-100">Vio.com</div>
      <div className="container mx-auto max-w-5xl">{children}</div>
    </div>
  )
}
