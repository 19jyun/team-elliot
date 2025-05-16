'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TeacherNavigation() {
  const pathname = usePathname()

  const navigationItems = [
    {
      label: '내 수업',
      href: '/dashboard/teacher',
    },
    {
      label: '수강생 관리',
      href: '/dashboard/teacher/students',
    },
    {
      label: '나의 정보',
      href: '/dashboard/teacher/profile',
    },
  ]

  return (
    <nav className="flex justify-around items-center w-full border-b border-stone-200 bg-white">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 text-center py-3 text-sm font-medium border-b-2 ${
              isActive
                ? 'text-stone-700 border-stone-700'
                : 'text-stone-400 border-transparent hover:text-stone-600'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
