'use client'

import { usePrincipalContext } from '@/contexts/PrincipalContext'
import { PrincipalRefundClassStep } from '../components/PrincipalRefundClassStep'
import { PrincipalRefundSessionStep } from '../components/PrincipalRefundSessionStep'
import { PrincipalRefundRequestStep } from '../components/PrincipalRefundRequestStep'

export function PrincipalRefundContainer() {
  const { personManagement } = usePrincipalContext()

  // 단계별 렌더링
  switch (personManagement.currentStep) {
    case 'class-list':
      return <PrincipalRefundClassStep />
    case 'session-list':
      return <PrincipalRefundSessionStep />
    case 'request-detail':
      return <PrincipalRefundRequestStep />
    default:
      return <PrincipalRefundClassStep />
  }
} 