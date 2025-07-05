import { CommonHeader } from '@/components/layout/CommonHeader';
import { DashboardProvider } from '@/contexts/DashboardContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </DashboardProvider>
  )
}
