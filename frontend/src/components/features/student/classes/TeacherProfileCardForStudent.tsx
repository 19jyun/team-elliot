'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Clock, GraduationCap, Award } from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'
import type { TeacherProfileResponse } from '@/types/api/teacher'

interface TeacherProfileCardForStudentProps {
  teacherId: number
}

export function TeacherProfileCardForStudent({ teacherId }: TeacherProfileCardForStudentProps) {
  const { loadProfileById } = useTeacherApi()
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await loadProfileById(teacherId)
        if (mounted) setProfile(data)
      } catch (e: any) {
        if (mounted) setError(e?.response?.data?.message || '선생님 정보를 불러오지 못했습니다.')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [teacherId, loadProfileById])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (error || !profile) {
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
              <AvatarImage src={getImageUrl(profile.photoUrl) || ''} alt={profile.name} />
              <AvatarFallback className="text-lg">{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            {profile.phoneNumber && <p className="text-gray-600 text-sm">{profile.phoneNumber}</p>}
          </div>
        </div>

        {/* 소개 */}
        {profile.introduction && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <User className="h-4 w-4" /> 소개
            </h4>
            <p className="text-gray-700 text-sm whitespace-pre-line">{profile.introduction}</p>
          </div>
        )}

        {/* 경력 */}
        {profile.yearsOfExperience && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" /> 교습 경력
            </h4>
            <p className="text-gray-700 text-sm">{profile.yearsOfExperience}년</p>
          </div>
        )}

        {/* 학력 */}
        {profile.education && profile.education.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4" /> 학력/경력
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.education.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 전문 분야 */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Award className="h-4 w-4" /> 전문 분야
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((item: string, index: number) => (
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

export default TeacherProfileCardForStudent


