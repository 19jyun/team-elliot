'use client'

import { useSession } from 'next-auth/react'
import { PrincipalSocketListener } from './PrincipalSocketListener'
import { TeacherSocketListener } from './TeacherSocketListener'
import { StudentSocketListener } from './StudentSocketListener'

// 역할별 리스너 매핑
const roleListeners = {
  PRINCIPAL: PrincipalSocketListener,
  TEACHER: TeacherSocketListener,
  STUDENT: StudentSocketListener,
  // ADMIN 제거됨
}

export function RoleBasedSocketListener() {
  const { data: session } = useSession()
  const userRole = session?.user?.role

  // 역할에 해당하는 리스너가 없으면 null 반환
  if (!userRole || !roleListeners[userRole as keyof typeof roleListeners]) {
    console.warn(`🚫 역할 '${userRole}'에 대한 소켓 리스너가 정의되지 않았습니다.`)
    return null
  }

  // 역할에 맞는 리스너 컴포넌트 동적 생성
  const ListenerComponent = roleListeners[userRole as keyof typeof roleListeners]
  
  
  return <ListenerComponent />
} 