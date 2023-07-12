import Image from 'next/image'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Vio.com',
  description: 'Vio.com server side rendering',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="px-7 py-6 border-b sticky top-0 bg-white z-50">

          <Image
            src=" https://www.vio.com/static/media/vio-logo.142636e625a9ec9028fe.svg"
            alt="vio.com"
            width={120}
            height={26}
          />

        </div>
        <div className="container mx-auto max-w-5xl">{children}</div>
      </body>
    </html>
  )
}
