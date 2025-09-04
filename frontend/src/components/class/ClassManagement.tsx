import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useAuthorization } from '@/hooks/useAuthorization';

interface ClassFormData {
  className: string;
  description: string;
  maxStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  time: string;
}

interface Enrollment {
  id: number;
  studentId: number;
  status: string;
}

interface ClassData {
  id: number;
  className: string;
  description: string;
  maxStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  time: string;
  enrollments?: Enrollment[];
}

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: '월요일' },
  { value: 'TUESDAY', label: '화요일' },
  { value: 'WEDNESDAY', label: '수요일' },
  { value: 'THURSDAY', label: '목요일' },
  { value: 'FRIDAY', label: '금요일' },
  { value: 'SATURDAY', label: '토요일' },
  { value: 'SUNDAY', label: '일요일' },
];

export function ClassManagement() {
  const { data: session } = useSession();
  const { hasPermission } = useAuthorization();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isAddingClass, setIsAddingClass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>();

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('수업 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onSubmit = async (data: ClassFormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          teacherId: session?.user?.id,
        }),
      });

      if (response.ok) {
        setIsAddingClass(false);
        reset();
        fetchClasses();
      }
    } catch (error) {
      console.error('수업 생성 실패:', error);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!window.confirm('정말 이 수업을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('수업 삭제 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      {hasPermission('manage-own-classes') && (
        <div className="flex justify-end">
          <button 
            onClick={() => setIsAddingClass(!isAddingClass)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isAddingClass ? '취소' : '수업 추가'}
          </button>
        </div>
      )}

      {isAddingClass && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">수업명</label>
            <input 
              {...register('className', { required: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.className && (
              <p className="mt-1 text-sm text-red-600">수업명은 필수입니다</p>
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
              <label className="block text-sm font-medium text-gray-700">최대 수강인원</label>
              <input
                type="number"
                {...register('maxStudents', { required: true, min: 1 })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.maxStudents && (
                <p className="mt-1 text-sm text-red-600">수강인원은 필수입니다</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">수강료</label>
              <input
                type="number"
                {...register('tuitionFee', { required: true, min: 0 })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.tuitionFee && (
                <p className="mt-1 text-sm text-red-600">수강료는 필수입니다</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">요일</label>
              <select 
                {...register('dayOfWeek', { required: true })}
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
                <p className="mt-1 text-sm text-red-600">요일은 필수입니다</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">시간</label>
              <input 
                type="time" 
                {...register('time', { required: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">시간은 필수입니다</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      )}

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수업명</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요일</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수강인원</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수강료</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {classes.map((classItem) => (
            <tr key={classItem.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.className}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.dayOfWeek}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(classItem.time).toLocaleTimeString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {classItem.enrollments?.length || 0}/{classItem.maxStudents || '∞'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.tuitionFee.toLocaleString()}원</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {hasPermission('manage-all-classes') && (
                  <button
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    삭제
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
