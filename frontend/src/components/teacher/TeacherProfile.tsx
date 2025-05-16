import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface TeacherProfileProps {
  teacherId: number;
}

interface ProfileFormData {
  introduction: string;
  photo: FileList;
}

export function TeacherProfile({ teacherId }: TeacherProfileProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formData = new FormData();
      if (data.introduction) {
        formData.append('introduction', data.introduction);
      }
      if (data.photo?.[0]) {
        formData.append('photo', data.photo[0]);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers/${teacherId}/profile`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <Avatar className="w-24 h-24">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt="Profile preview" />
          ) : (
            <AvatarFallback>
              {session?.user?.name?.[0]?.toUpperCase() || 'T'}
            </AvatarFallback>
          )}
        </Avatar>
        
        {isEditing && (
          <Input
            type="file"
            accept="image/*"
            {...register('photo')}
            onChange={onPhotoChange}
            className="w-full max-w-xs"
          />
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            소개
          </label>
          <Textarea
            {...register('introduction')}
            disabled={!isEditing}
            className="mt-1"
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                취소
              </Button>
              <Button type="submit">저장</Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              수정
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
