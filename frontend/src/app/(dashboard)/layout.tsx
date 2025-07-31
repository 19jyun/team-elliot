import { DashboardProvider } from '@/contexts/DashboardContext';
import { AppInitializer } from '@/components/common/AppInitializer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <AppInitializer>
        {children}
      </AppInitializer>
    </DashboardProvider>
  )
}
