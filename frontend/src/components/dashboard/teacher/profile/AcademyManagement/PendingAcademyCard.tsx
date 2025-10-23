'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock } from 'lucide-react';
import { formatDate } from '@/utils/academyUtils';
import { ExpandableText } from '@/components/common/ExpandableText';

interface PendingAcademyCardProps {
  academyName: string;
  message?: string;
  createdAt: string;
}

export function PendingAcademyCard({ 
  academyName, 
  message, 
  createdAt 
}: PendingAcademyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow border-[#AC9592]/30 bg-[#AC9592]/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-[#AC9592]">{academyName}</CardTitle>
            <Badge variant="outline" className="mt-2 border-[#AC9592] text-[#AC9592]">
              가입 신청 대기 중
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[#AC9592]">
            <Clock className="h-4 w-4" />
            <span>신청일: {formatDate(createdAt)}</span>
          </div>
        </div>
        
        {message && (
          <div className="rounded-md bg-[#AC9592]/10 p-3">
            <ExpandableText
              text={`신청 메시지: ${message}`}
              lineClamp={3}
              className="text-sm text-[#AC9592]"
              buttonText={{ expand: '더보기', collapse: '접기' }}
            />
          </div>
        )}

        {/* 가입신청 완료 텍스트 */}
        <Separator />
        <div className="text-center text-sm text-[#AC9592] py-2 font-medium">
          가입신청 완료
        </div>
      </CardContent>
    </Card>
  );
}
