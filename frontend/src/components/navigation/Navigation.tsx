import * as React from 'react'
import { NavigationItem } from './NavigationItem'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavigationData {
  label: string
  href: string
}

export const Navigation: React.FC = () => {
  const pathname = usePathname()

  const navigationItems: NavigationData[] = [
    { label: '클래스 정보', href: '/dashboard/student' },
    { label: '수강신청', href: '/dashboard/student/enroll' },
    { label: '나의 정보', href: '/dashboard/student/profile' },
  ]

  return (
    <nav className="flex items-center justify-center px-5 w-full bg-white shadow-sm">
      <div
        className="flex justify-center gap-1 -mb-px w-full max-w-[480px]"
        role="tablist"
      >
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 focus:outline-none"
          >
            <NavigationItem
              label={item.label}
              isActive={pathname === item.href}
            />
          </Link>
        ))}
      </div>
    </nav>
  )
}
