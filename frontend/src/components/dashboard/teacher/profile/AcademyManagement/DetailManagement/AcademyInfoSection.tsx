'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface AcademyInfoSectionProps {
  academy: any;
}

export default function AcademyInfoSection({ academy }: AcademyInfoSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            학원 정보
          </CardTitle>
          <CardDescription>
            학원명, 주소, 전화번호, 설명 등을 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">학원명</label>
              <p className="text-sm text-gray-600">{academy?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">학원 코드</label>
              <p className="text-sm text-gray-600">{academy?.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium">주소</label>
              <p className="text-sm text-gray-600">{academy?.address || '등록되지 않음'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">전화번호</label>
              <p className="text-sm text-gray-600">{academy?.phoneNumber || '등록되지 않음'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">설명</label>
              <p className="text-sm text-gray-600">{academy?.description || '등록되지 않음'}</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline" disabled>
              정보 수정 (기본 관리 탭에서 가능)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 