import { useSession, signOut } from 'next-auth/react'
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import Link from 'next/link'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-indigo-600">
                  학원 관리 시스템
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <UserCircleIcon className="h-6 w-6" />
                <span className="font-medium">{session?.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>로그아웃</span>
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-gray-700 py-2">
              <UserCircleIcon className="h-6 w-6" />
              <span className="font-medium">{session?.user?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">{children}</div>
      </main>
    </div>
  )
}
