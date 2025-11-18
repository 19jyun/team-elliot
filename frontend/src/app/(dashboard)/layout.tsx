// AppInitializer는 이제 루트 layout에서 제공됨
import { CalendarSyncManager } from "@/components/calendar/CalendarSyncManager";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CalendarSyncManager />
      {children}
    </>
  )
}
