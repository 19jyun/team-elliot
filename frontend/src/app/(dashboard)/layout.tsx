import { CommonHeader } from '@/components/layout/CommonHeader';
import { DashboardProvider } from '@/contexts/DashboardContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <div className="h-screen bg-gray-50 overflow-hidden">
        <CommonHeader />
        <main className="h-full overflow-hidden">
          {children}
        </main>
      </div>
    </DashboardProvider>
  )
}
