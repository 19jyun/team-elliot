interface ClassFormProps {
  onSubmit: (data: ClassFormData) => void
}

interface ClassFormData {
  className: string
  description?: string
  maxStudents: number
  tuitionFee: number
  dayOfWeek: string
  time: string
}

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: '월요일' },
  { value: 'TUESDAY', label: '화요일' },
  { value: 'WEDNESDAY', label: '수요일' },
  { value: 'THURSDAY', label: '목요일' },
  { value: 'FRIDAY', label: '금요일' },
]

export function ClassForm({ onSubmit }: ClassFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormData>()


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          수업명
        </label>
        <input
          {...register('className', { required: '수업명은 필수입니다' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.className && (
          <p className="mt-1 text-sm text-red-600">
            {errors.className.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">설명</label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            최대 수강인원
          </label>
          <input
            type="number"
            {...register('maxStudents', {
              required: '수강인원은 필수입니다',
              min: 1,
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.maxStudents && (
            <p className="mt-1 text-sm text-red-600">
              {errors.maxStudents.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            수강료
          </label>
          <input
            type="number"
            {...register('tuitionFee', {
              required: '수강료는 필수입니다',
              min: 0,
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.tuitionFee && (
            <p className="mt-1 text-sm text-red-600">
              {errors.tuitionFee.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            요일
          </label>
          <select
            {...register('dayOfWeek', { required: '요일은 필수입니다' })}

            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">요일 선택</option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && (
            <p className="mt-1 text-sm text-red-600">
              {errors.dayOfWeek.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            시간
          </label>
          <input
            type="time"
            {...register('time', { required: '시간은 필수입니다' })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </form>
  )
}
