'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminNavigation() {
  const pathname = usePathname()

  const menuLinks = [
    {
      label: '수강생 관리',
      href: '/dashboard/admin/students',
    },
    {
      label: '선생님 관리',
      href: '/dashboard/admin/teachers',
    },
    {
      label: '수업 관리',
      href: '/dashboard/admin/classes',
    },
  ]

  return (
    <nav className="flex items-center justify-center px-5 w-full bg-white border-b border-stone-200">
      <div className="flex justify-center gap-1 w-full max-w-[480px]">
        {menuLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
              pathname === link.href
                ? 'text-stone-900 border-b-2 border-stone-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
