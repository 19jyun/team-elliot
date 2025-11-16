'use client'

import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Clock, GraduationCap, Award } from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'
import { useStudentTeacherProfile } from '@/hooks/queries/student/useStudentTeacherProfile'
import type { TeacherProfileCardForStudentVM, TeacherProfileDisplayVM } from '@/types/view/student'
import { toTeacherProfileDisplayVM, toTeacherProfileForStudentVM } from '@/lib/adapters/student'

export function TeacherProfileCardForStudent({ teacherId }: TeacherProfileCardForStudentVM) {
  // React Query 기반 데이터 관리
  const { data: profileData, isLoading, error: queryError } = useStudentTeacherProfile(teacherId)

  // ViewModel 생성
  const profile = useMemo(() => {
    if (!profileData) return null
    return toTeacherProfileForStudentVM(profileData)
  }, [profileData])

  const error = queryError ? (queryError instanceof Error ? queryError.message : '선생님 정보를 불러오지 못했습니다.') : null

  // View Model 생성
  const displayVM: TeacherProfileDisplayVM = toTeacherProfileDisplayVM(profile, isLoading, error)

  if (displayVM.isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (displayVM.error || !profile) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-stone-500">
          선생님 정보를 불러올 수 없습니다.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* 프로필 사진 및 기본 정보 */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={getImageUrl(displayVM.displayPhotoUrl) || ''} alt={displayVM.displayName} />
              <AvatarFallback className="text-lg">{displayVM.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">{displayVM.displayName}</h3>
            {displayVM.displayPhoneNumber && <p className="text-gray-600 text-sm">{displayVM.displayPhoneNumber}</p>}
          </div>
        </div>

        {/* 소개 */}
        {displayVM.displayIntroduction && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <User className="h-4 w-4" /> 소개
            </h4>
            <p className="text-gray-700 text-sm whitespace-pre-line">{displayVM.displayIntroduction}</p>
          </div>
        )}

        {/* 경력 */}
        {displayVM.displayYearsOfExperience && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" /> 교습 경력
            </h4>
            <p className="text-gray-700 text-sm">{displayVM.displayYearsOfExperience}</p>
          </div>
        )}

        {/* 학력 */}
        {displayVM.hasEducation && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4" /> 학력/경력
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayVM.education?.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 전문 분야 */}
        {displayVM.hasSpecialties && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Award className="h-4 w-4" /> 전문 분야
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayVM.specialties?.map((item: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



