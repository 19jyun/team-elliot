import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session?.user?.role) {
    redirect('/login')
  }

  const roleRedirects = {
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
    admin: '/dashboard/admin',
  }

  const redirectPath =
    roleRedirects[session.user.role as keyof typeof roleRedirects]

  if (!redirectPath) {
    redirect('/login')
  }

  redirect(redirectPath)
}
