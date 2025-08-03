'use client'

import { useState } from 'react'
import { useSocket } from '@/hooks/socket/useSocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SocketTest() {
  const { isConnected, emit } = useSocket()
  const [sourceEvent, setSourceEvent] = useState('test_event')
  const [message, setMessage] = useState('테스트 메시지')
  const [response, setResponse] = useState<string>('')

  const handleTestUpdateRequired = () => {
    if (!isConnected) {
      setResponse('소켓이 연결되지 않았습니다.')
      return
    }

    emit('test_update_required', {
      sourceEvent,
      message,
    })

    setResponse('테스트 이벤트를 전송했습니다.')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>소켓 테스트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">연결 상태</label>
          <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '연결됨' : '연결 안됨'}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">소스 이벤트</label>
          <Input
            value={sourceEvent}
            onChange={(e) => setSourceEvent(e.target.value)}
            placeholder="이벤트 이름"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">메시지</label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="테스트 메시지"
          />
        </div>

        <Button 
          onClick={handleTestUpdateRequired}
          disabled={!isConnected}
          className="w-full"
        >
          update_required 테스트
        </Button>

        {response && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {response}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 