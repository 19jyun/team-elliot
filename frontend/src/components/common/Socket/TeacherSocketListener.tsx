'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { SocketQuerySync } from '@/lib/socket/socketQuerySync'
import { toast } from 'sonner'
import type { SocketEventData } from '@/types/socket'

export function TeacherSocketListener() {
  const queryClient = useQueryClient()
  const socketSync = new SocketQuerySync(queryClient)

  useSocketEvent('class_created', (data) => {
    console.log('📨 새로운 강의 생성 패킷 수신:', data)
    socketSync.handleSocketEvent('class_created', data as SocketEventData<'class_created'>)
    toast.info('새로운 강의가 개설되었습니다.', {
      description: `강의명: ${data.className}`,
      duration: 8000,
    })
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', () => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
      duration: 8000,
    })
  })

  return null
}