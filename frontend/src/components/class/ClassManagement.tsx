import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthorization } from '@/hooks/useAuthorization';

interface ClassFormData {
  className: string;
  description: string;
  maxStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  time: string;
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
  const [classes, setClasses] = useState<any[]>([]);
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
          <Button onClick={() => setIsAddingClass(!isAddingClass)}>
            {isAddingClass ? '취소' : '수업 추가'}
          </Button>
        </div>
      )}

      {isAddingClass && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">수업명</label>
            <Input {...register('className', { required: true })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">설명</label>
            <Textarea {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">최대 수강인원</label>
              <Input
                type="number"
                {...register('maxStudents', { required: true, min: 1 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">수강료</label>
              <Input
                type="number"
                {...register('tuitionFee', { required: true, min: 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">요일</label>
              <Select onValueChange={(value) => register('dayOfWeek').onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="요일 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">시간</label>
              <Input type="time" {...register('time', { required: true })} />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit">저장</Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>수업명</TableHead>
            <TableHead>요일</TableHead>
            <TableHead>시간</TableHead>
            <TableHead>수강인원</TableHead>
            <TableHead>수강료</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((classItem) => (
            <TableRow key={classItem.id}>
              <TableCell>{classItem.className}</TableCell>
              <TableCell>{classItem.dayOfWeek}</TableCell>
              <TableCell>{new Date(classItem.time).toLocaleTimeString()}</TableCell>
              <TableCell>
                {classItem.enrollments.length}/{classItem.maxStudents || '∞'}
              </TableCell>
              <TableCell>{classItem.tuitionFee.toLocaleString()}원</TableCell>
              <TableCell>
                {hasPermission('manage-all-classes') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClass(classItem.id)}
                  >
                    삭제
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
