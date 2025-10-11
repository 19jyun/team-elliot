// AppInitializer는 이제 루트 layout에서 제공됨
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
