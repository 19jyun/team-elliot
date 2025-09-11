// DashboardProvider는 이제 AppProvider에 통합되어 상위에서 제공됨
import { AppInitializer } from '@/components/common/AppInitializer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppInitializer>
      {children}
    </AppInitializer>
  )
}
