'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { Toaster } from 'sonner'
import { ImprovedAppProvider } from '@/contexts/ImprovedAppContext'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ImprovedAppProvider>
            {children}
            <Toaster position="top-right" />
          </ImprovedAppProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Provider>
  )
}
