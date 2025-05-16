'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { TeacherNavigation } from '@/components/navigation/TeacherNavigation'
import axiosInstance from '@/lib/axios'

export default function TeacherStudentsPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  const { data: myStudents, isLoading } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher/students')
      return response.data
    },
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col w-full">
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 w-full min-h-[60px]">
          <Image
            src="/images/logo/team-eliot-3.png"
            alt="Team Eliot Logo"
            width={77}
            height={46}
            className="object-contain"
            priority
          />
        </div>
        <TeacherNavigation />
      </div>

      <div className="flex flex-col px-5 py-6">
        <h1 className="text-2xl font-bold text-stone-700">수강생 관리</h1>
        <p className="mt-2 text-stone-500">
          내 수업을 수강하는 학생들을 관리할 수 있습니다.
        </p>
      </div>

      <div className="px-5 space-y-4">
        {myStudents?.map((student) => (
          <div
            key={student.id}
            className="bg-stone-50 p-4 rounded-lg hover:bg-stone-100 transition-colors duration-200"
          >
            <p className="font-semibold text-stone-900">{student.name}</p>
            <p className="text-sm text-stone-600">{student.className}</p>
            <p className="text-sm text-stone-500">
              출석률: {student.attendanceRate}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
