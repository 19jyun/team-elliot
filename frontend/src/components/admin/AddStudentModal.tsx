'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AddStudentModalProps {
  onClose: () => void
  onSubmit: (data: StudentFormData) => void
}

interface StudentFormData {
  userId: string
  password: string
  name: string
  phoneNumber: string
  emergencyContact?: string
  birthDate?: string
  notes?: string
  level?: string
}

export function AddStudentModal({ onClose, onSubmit }: AddStudentModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    userId: '',
    password: '',
    name: '',
    phoneNumber: '',
    emergencyContact: '',
    birthDate: '',
    notes: '',
    level: '',
  })
  const [touched, setTouched] = useState({
    userId: false,
    password: false,
    name: false,
    phoneNumber: false, // touched 상태에 추가
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 모든 필수 필드를 touched로 설정
    setTouched({
      userId: true,
      password: true,
      name: true,
      phoneNumber: true,
    })

    if (!formData.userId || !formData.password || !formData.name) {
      toast.error('필수 항목을 모두 입력해주세요.')
      return
    }

    onSubmit(formData)
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isFieldInvalid = (field: keyof typeof touched) => {
    return touched[field] && !formData[field]
  }

  const inputClassName = (field: keyof typeof touched) =>
    cn(
      'w-full px-3 py-2 border rounded-md transition-colors',
      isFieldInvalid(field)
        ? 'border-red-500 focus:border-red-500'
        : 'border-gray-300 focus:border-stone-500',
    )

  const labelClassName = (field: keyof typeof touched) =>
    cn(
      'block text-sm font-medium mb-1',
      isFieldInvalid(field) ? 'text-red-500' : 'text-gray-700',
    )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">새 수강생 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClassName('userId')}>
              아이디 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              onBlur={() => handleBlur('userId')}
              className={inputClassName('userId')}
              required
            />
            {isFieldInvalid('userId') && (
              <p className="mt-1 text-sm text-red-500">
                아이디를 입력해주세요.
              </p>
            )}
          </div>

          <div>
            <label className={labelClassName('password')}>
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={inputClassName('password')}
              required
            />
            {isFieldInvalid('password') && (
              <p className="mt-1 text-sm text-red-500">
                비밀번호를 입력해주세요.
              </p>
            )}
          </div>

          <div>
            <label className={labelClassName('name')}>
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={inputClassName('name')}
              required
            />
            {isFieldInvalid('name') && (
              <p className="mt-1 text-sm text-red-500">이름을 입력해주세요.</p>
            )}
          </div>

          <div>
            <label className={labelClassName('phoneNumber')}>
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={() => handleBlur('phoneNumber')}
              className={inputClassName('phoneNumber')}
              placeholder="010-0000-0000"
              required
            />
            {isFieldInvalid('phoneNumber') && (
              <p className="mt-1 text-sm text-red-500">
                연락처를 입력해주세요.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비상연락처 <span className="text-gray-500">(선택)</span>
            </label>
            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="010-0000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              생년월일 <span className="text-gray-500">(선택)</span>
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              레벨 <span className="text-gray-500">(선택)</span>
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">선택해주세요</option>
              <option value="BEGINNER">초급</option>
              <option value="INTERMEDIATE">중급</option>
              <option value="ADVANCED">고급</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              특이사항 <span className="text-gray-500">(선택)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="알러지, 부상 이력 등"
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900"
            >
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
