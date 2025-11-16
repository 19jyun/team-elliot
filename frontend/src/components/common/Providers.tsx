'use client'

import { SessionProvider } from '@/lib/auth/AuthProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { SlidingSessionProvider } from '@/components/auth/SlidingSessionProvider'
import { SplashController } from '@/components/common/SplashController'
import { queryClient } from '@/lib/react-query/queryClient'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <SlidingSessionProvider>
              <SplashController />
              {children}
              <Toaster position="top-right" />
            </SlidingSessionProvider>
          </AppProvider>
        </QueryClientProvider>
      </SessionProvider>
    </Provider>
  )
}
