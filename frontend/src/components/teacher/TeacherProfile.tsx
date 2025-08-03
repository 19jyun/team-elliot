import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const handlePhotoClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsUploading(true);
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
        toast.success('프로필이 성공적으로 업데이트되었습니다.');
        setIsEditing(false);
        // 페이지 새로고침 또는 데이터 재조회
        window.location.reload();
      } else {
        toast.error('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      toast.error('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar 
            className={`w-24 h-24 cursor-pointer transition-opacity hover:opacity-80 ${
              isEditing ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={handlePhotoClick}
          >
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt="Profile preview" />
            ) : (
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase() || 'T'}
              </AvatarFallback>
            )}
          </Avatar>
          
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        
        {isEditing && (
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            {...register('photo')}
            onChange={onPhotoChange}
            className="hidden"
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
                disabled={isUploading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? '업로드 중...' : '저장'}
              </Button>
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
