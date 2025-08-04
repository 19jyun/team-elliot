'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/academyUtils';
import { ExpandableText } from '@/components/common/ExpandableText';

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
  academy: CommonAcademy; // 필수 prop으로 변경
  variant?: 'teacher' | 'student' | 'principal';
  onAction?: () => void;
  actionText?: string;
  actionVariant?: 'default' | 'destructive' | 'outline';
  showActionButton?: boolean;
  infoMessage?: string;
  showTeamCode?: boolean;
}

export function AcademyCard({ 
  academy, 
  variant = 'teacher',
  onAction,
  actionText,
  actionVariant = 'outline',
  showActionButton = false,
  infoMessage,
  showTeamCode = false
}: AcademyCardProps) {
  // academy 데이터가 없으면 렌더링하지 않음
  if (!academy) {
    return null;
  }
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{academy.name}</CardTitle>
            {showTeamCode && (
            <Badge variant="secondary" className="mt-2">
              {academy.code}
                          </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {academy.address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{academy.address}</span>
            </div>
          )}
          {academy.phoneNumber && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{academy.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>가입일: {formatDate(academy.createdAt)}</span>
          </div>
        </div>
        
        {academy.description && (
          <ExpandableText
            text={academy.description}
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