'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { updateClassDetails } from '@/api/teacher'
import { toast } from 'sonner'

import { TeacherClassesResponse } from '@/types/api/teacher'

type ClassData = TeacherClassesResponse[0]

interface TeacherClassDetailProps {
  classId: number
  classData: ClassData
}

export const TeacherClassDetail: React.FC<TeacherClassDetailProps> = ({
  classId,
  classData,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    description: classData.description || '',
    locationName: '',
    mapImageUrl: '',
    requiredItems: [] as string[],
    curriculum: [] as string[],
  })
  const [newRequiredItem, setNewRequiredItem] = useState('')
  const [newCurriculumItem, setNewCurriculumItem] = useState('')

  const queryClient = useQueryClient()

  const updateClassDetailsMutation = useMutation({
    mutationFn: (data: any) => updateClassDetails(classId, data),
    onSuccess: () => {
      toast.success('클래스 정보가 수정되었습니다.')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] })
    },
    onError: (error) => {
      toast.error('클래스 정보 수정에 실패했습니다.')
      console.error('Update class details error:', error)
    },
  })

  const getDayOfWeekText = (dayOfWeek: string) => {
    const dayMap: { [key: string]: string } = {
      'MONDAY': '월',
      'TUESDAY': '화',
      'WEDNESDAY': '수',
      'THURSDAY': '목',
      'FRIDAY': '금',
      'SATURDAY': '토',
      'SUNDAY': '일',
    }
    return dayMap[dayOfWeek] || dayOfWeek
  }

  const getLevelText = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'BEGINNER': '초급',
      'INTERMEDIATE': '중급',
      'ADVANCED': '고급',
    }
    return levelMap[level] || level
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(`1970-01-01T${timeString}`)
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeString
    }
  }

  const handleSave = () => {
    updateClassDetailsMutation.mutate(editData)
  }

  const handleCancel = () => {
    setEditData({
      description: classData.description || '',
      locationName: '',
      mapImageUrl: '',
      requiredItems: [],
      curriculum: [],
    })
    setIsEditing(false)
  }

  const addRequiredItem = () => {
    if (newRequiredItem.trim()) {
      setEditData(prev => ({
        ...prev,
        requiredItems: [...prev.requiredItems, newRequiredItem.trim()]
      }))
      setNewRequiredItem('')
    }
  }

  const removeRequiredItem = (index: number) => {
    setEditData(prev => ({
      ...prev,
      requiredItems: prev.requiredItems.filter((_, i) => i !== index)
    }))
  }

  const addCurriculumItem = () => {
    if (newCurriculumItem.trim()) {
      setEditData(prev => ({
        ...prev,
        curriculum: [...prev.curriculum, newCurriculumItem.trim()]
      }))
      setNewCurriculumItem('')
    }
  }

  const removeCurriculumItem = (index: number) => {
    setEditData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-stone-700">클래스 정보</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-stone-700 rounded-lg hover:bg-stone-800"
          >
            정보 수정
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={updateClassDetailsMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-stone-700 rounded-lg hover:bg-stone-800 disabled:opacity-50"
            >
              {updateClassDetailsMutation.isPending ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200"
            >
              취소
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!isEditing ? (
          // 읽기 전용 모드
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-lg">
              <h3 className="font-semibold text-stone-700 mb-2">기본 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">클래스명:</span>
                  <span className="font-medium">{classData.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">레벨:</span>
                  <span className="font-medium">{getLevelText(classData.level)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">수업 시간:</span>
                  <span className="font-medium">
                    {getDayOfWeekText(classData.dayOfWeek)} {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">수강생:</span>
                  <span className="font-medium">{classData.currentStudents} / {classData.maxStudents}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">수강료:</span>
                  <span className="font-medium">{classData.tuitionFee.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {classData.description && (
              <div className="bg-stone-50 p-4 rounded-lg">
                <h3 className="font-semibold text-stone-700 mb-2">클래스 설명</h3>
                <p className="text-sm text-stone-600">{classData.description}</p>
              </div>
            )}
          </div>
        ) : (
          // 편집 모드
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-lg">
              <h3 className="font-semibold text-stone-700 mb-3">클래스 설명</h3>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-stone-300 rounded-lg resize-none"
                rows={4}
                placeholder="클래스에 대한 설명을 입력하세요..."
              />
            </div>

            <div className="bg-stone-50 p-4 rounded-lg">
              <h3 className="font-semibold text-stone-700 mb-3">수업 장소</h3>
              <input
                type="text"
                value={editData.locationName}
                onChange={(e) => setEditData(prev => ({ ...prev, locationName: e.target.value }))}
                className="w-full p-3 border border-stone-300 rounded-lg"
                placeholder="수업 장소를 입력하세요..."
              />
            </div>

            <div className="bg-stone-50 p-4 rounded-lg">
              <h3 className="font-semibold text-stone-700 mb-3">준비물</h3>
              <div className="space-y-2">
                {editData.requiredItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 p-2 bg-white border border-stone-300 rounded">{item}</span>
                    <button
                      onClick={() => removeRequiredItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequiredItem}
                    onChange={(e) => setNewRequiredItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequiredItem()}
                    className="flex-1 p-2 border border-stone-300 rounded"
                    placeholder="준비물 추가..."
                  />
                  <button
                    onClick={addRequiredItem}
                    className="px-3 py-2 text-sm bg-stone-700 text-white rounded hover:bg-stone-800"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-lg">
              <h3 className="font-semibold text-stone-700 mb-3">커리큘럼</h3>
              <div className="space-y-2">
                {editData.curriculum.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 p-2 bg-white border border-stone-300 rounded">{item}</span>
                    <button
                      onClick={() => removeCurriculumItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCurriculumItem}
                    onChange={(e) => setNewCurriculumItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCurriculumItem()}
                    className="flex-1 p-2 border border-stone-300 rounded"
                    placeholder="커리큘럼 추가..."
                  />
                  <button
                    onClick={addCurriculumItem}
                    className="px-3 py-2 text-sm bg-stone-700 text-white rounded hover:bg-stone-800"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 