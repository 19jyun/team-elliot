'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

interface ClassCreationSectionProps {
  academy: any;
}

export default function ClassCreationSection({ academy }: ClassCreationSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            새 강의 개설
          </CardTitle>
          <CardDescription>
            강의 정보를 입력하고 담당 선생님을 지정해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>강의 개설 기능은 현재 개발 중입니다.</p>
            <p className="text-sm">선생님 지정 강의 개설 API가 연동되면 사용할 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 