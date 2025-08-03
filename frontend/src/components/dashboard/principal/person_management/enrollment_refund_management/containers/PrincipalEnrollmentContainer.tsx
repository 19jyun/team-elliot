'use client'

import { usePrincipalContext } from '@/contexts/PrincipalContext'
import { PrincipalEnrollmentClassStep } from '../components/PrincipalEnrollmentClassStep'
import { PrincipalEnrollmentSessionStep } from '../components/PrincipalEnrollmentSessionStep'
import { PrincipalEnrollmentRequestStep } from '../components/PrincipalEnrollmentRequestStep'

export function PrincipalEnrollmentContainer() {
  const { personManagement } = usePrincipalContext()

  // 단계별 렌더링
  switch (personManagement.currentStep) {
    case 'class-list':
      return <PrincipalEnrollmentClassStep />
    case 'session-list':
      return <PrincipalEnrollmentSessionStep />
    case 'request-detail':
      return <PrincipalEnrollmentRequestStep />
    default:
      return <PrincipalEnrollmentClassStep />
  }
} 