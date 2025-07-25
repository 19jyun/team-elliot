'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Calendar, Settings } from 'lucide-react';
import { Academy } from '@/types/api/teacher';
import { formatDate } from '@/utils/academyUtils';
import { ExpandableText } from '@/components/common/ExpandableText';

interface AcademyCardProps {
  academy: Academy;
  isAdmin: boolean;
  onEdit: () => void;
}

export function AcademyCard({ academy, isAdmin, onEdit }: AcademyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{academy.name}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {academy.code}
            </Badge>
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

        <Separator />

        {isAdmin && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onEdit}
            >
              <Settings className="h-4 w-4 mr-2" />
              학원 정보 수정
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 