'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { SlidingSessionProvider } from '@/components/auth/SlidingSessionProvider'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <SlidingSessionProvider>
              {children}
              <Toaster position="top-right" />
            </SlidingSessionProvider>
          </AppProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Provider>
  )
}
