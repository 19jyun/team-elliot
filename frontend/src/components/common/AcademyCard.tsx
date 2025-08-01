'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/academyUtils';
import { ExpandableText } from '@/components/common/ExpandableText';
import { useTeacherData } from '@/hooks/redux/useTeacherData';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';
import { useStudentData } from '@/hooks/redux/useStudentData';
import { useSession } from 'next-auth/react';

// 공통 Academy 타입 정의
interface CommonAcademy {
  id: number;
  name: string;
  code: string;
  address?: string;
  phoneNumber?: string;
  description?: string;
  createdAt: string;
}

interface AcademyCardProps {
  academy?: CommonAcademy; // Redux에서 가져올 수 있으므로 optional로 변경
  variant?: 'teacher' | 'student' | 'principal';
  onAction?: () => void;
  actionText?: string;
  actionVariant?: 'default' | 'destructive' | 'outline';
  showActionButton?: boolean;
  infoMessage?: string;
  showTeamCode?: boolean;
  useRedux?: boolean; // Redux 사용 여부
}

export function AcademyCard({ 
  academy, 
  variant = 'teacher',
  onAction,
  actionText,
  actionVariant = 'outline',
  showActionButton = false,
  infoMessage,
  showTeamCode = false,
  useRedux = false
}: AcademyCardProps) {
  const { data: session } = useSession();
  const teacherData = useTeacherData();
  const principalData = usePrincipalData();
  const studentData = useStudentData();

  // Redux 사용 시 role에 따라 academy 데이터 가져오기
  let academyData = academy;
  if (useRedux && !academy) {
    const userRole = session?.user?.role;
    if (userRole === 'TEACHER') {
      academyData = teacherData.academy || undefined;
    } else if (userRole === 'PRINCIPAL') {
      academyData = principalData.academy || undefined;
    } else if (userRole === 'STUDENT') {
      academyData = studentData.academy || undefined;
    }
  }

  // academy 데이터가 없으면 렌더링하지 않음
  if (!academyData) {
    return null;
  }
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{academyData.name}</CardTitle>
            {showTeamCode && (
            <Badge variant="secondary" className="mt-2">
              {academyData.code}
                          </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {academyData.address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{academyData.address}</span>
            </div>
          )}
          {academyData.phoneNumber && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{academyData.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>가입일: {formatDate(academyData.createdAt)}</span>
          </div>
        </div>
        
        {academyData.description && (
          <ExpandableText
            text={academyData.description}
            lineClamp={3}
            className="text-sm text-gray-600"
            buttonText={{ expand: '더보기', collapse: '접기' }}
          />
        )}

        {/* 액션 버튼 또는 정보 메시지 */}
        {showActionButton && onAction ? (
          <>
            <Separator />
          <div className="flex gap-2">
            <Button 
              variant={actionVariant}
              size="sm" 
              className={`flex-1 ${actionText === '탈퇴하기' ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : ''}`}
              onClick={onAction}
            >
              {actionText}
            </Button>
          </div>
          </>
              ) : infoMessage ? (
          <>
            <Separator />
          <div className="text-center text-sm text-gray-500 py-2">
            {infoMessage}
          </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
} 