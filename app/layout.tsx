import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/lib/providers'
import { AuthGuard } from '@/components/auth/auth-guard'
import './globals.css'


export const metadata: Metadata = {
  title: 'AIKI Merchant',
  description: 'AIKI Merchant App'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
