import '@/app/globals.css'
import Providers from '@/components/common/Providers'
import { AppInitializer } from '@/components/common/AppInitializer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <AppInitializer>
          <Providers>{children}</Providers>
        </AppInitializer>
      </body>
    </html>
  )
}
